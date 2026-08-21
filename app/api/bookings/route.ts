import { NextRequest, NextResponse } from "next/server";
import { db, pool } from "@/db";
import { auth } from "@/lib/auth";
import {
  appointment,
  appointmentStatusHistory,
  service,
  staffProfile,
  business,
  weeklyAvailability,
  breakPeriod,
  timeOff,
  staffService,
} from "@/db/schema";
import { eq, and, ne, gte, lte } from "drizzle-orm";
import { bookingSchema } from "@/lib/validators/booking";
import { nanoid } from "nanoid";
import { getAvailableSlots } from "@/features/availability/engin";
import type {
  WorkingHours,
  BreakPeriodData,
  TimeOffData,
  ExistingAppointment,
} from "@/features/availability/engin";
import { startOfDay, endOfDay, addDays } from "date-fns";

function generateBookingRef(): string {
  return `SL-${nanoid(8).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid booking data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const requestedStart = new Date(data.startAt);
    const requestedEnd = new Date(data.endAt);

    if (requestedStart <= new Date()) {
      return NextResponse.json(
        { error: "Cannot book appointments in the past" },
        { status: 400 },
      );
    }

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const customerId = session?.user.id || null;

    const [svc] = await db
      .select()
      .from(service)
      .where(and(eq(service.id, data.serviceId), eq(service.isActive, true)));

    if (!svc) {
      return NextResponse.json(
        { error: "Service not found or inactive" },
        { status: 404 },
      );
    }

    const [staff] = await db
      .select()
      .from(staffProfile)
      .where(
        and(eq(staffProfile.id, data.staffId), eq(staffProfile.isActive, true)),
      );
    if (!staff) {
      return NextResponse.json(
        { error: "Staff member not found or inactive" },
        { status: 404 },
      );
    }

    const [assignment] = await db
      .select()
      .from(staffService)
      .where(
        and(
          eq(staffService.staffId, data.staffId),
          eq(staffService.serviceId, data.serviceId),
        ),
      );

    if (!assignment) {
      return NextResponse.json(
        { error: "Staff member is not assigned to this service" },
        { status: 400 },
      );
    }

    const [biz] = await db
      .select()
      .from(business)
      .where(eq(business.id, svc.businessId));

    if (!biz) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 },
      );
    }

    const dayStart = startOfDay(requestedStart);
    const dayEnd = endOfDay(requestedEnd);

    const [workHours, breaks, timeOffs, existingApts] = await Promise.all([
      db
        .select()
        .from(weeklyAvailability)
        .where(eq(weeklyAvailability.staffId, data.staffId)),

      db
        .select()
        .from(breakPeriod)
        .where(eq(breakPeriod.staffId, data.staffId)),

      db.select().from(timeOff).where(eq(timeOff.staffId, data.staffId)),

      db
        .select()
        .from(appointment)
        .where(
          and(
            eq(appointment.staffId, data.staffId),
            ne(appointment.status, "CANCELLED"),
            gte(appointment.startAt, dayStart),
            lte(appointment.endAt, addDays(dayEnd, 1)),
          ),
        ),
    ]);

    const slots = getAvailableSlots({
      date: requestedStart,
      timezone: biz.timezone,
      serviceDuration: svc.durationMinutes,
      bufferBefore: svc.bufferBefore,
      bufferAfter: svc.bufferAfter,
      slotInterval: biz.slotInterval,
      minBookingNotice: biz.minBookingNotice,
      maxAdvanceBookingDays: biz.maxAdvanceBookingDays,
      workingHours: workHours as WorkingHours[],
      breaks: breaks as BreakPeriodData[],
      timeOffs: timeOffs as TimeOffData[],
      existingAppointments: existingApts as ExistingAppointment[],
    });

    const slotAvailable = slots.some(
      (s) =>
        s.start.getTime() === requestedStart.getTime() &&
        s.end.getTime() === requestedEnd.getTime(),
    );

    if (!slotAvailable) {
      return NextResponse.json(
        {
          error:
            "This time slot is no longer available. Please select another time.",
        },
        { status: 409 },
      );
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const overlapCheck = await client.query(
        `SELECT id FROM appointment
         WHERE staff_id = $1
         AND status != 'CANCELLED'
         AND start_at < $3
         AND end_at > $2
         FOR UPDATE`,
        [
          data.staffId,
          requestedStart.toISOString(),
          requestedEnd.toISOString(),
        ],
      );

      if (overlapCheck.rows.length > 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          {
            error:
              "This time slot was just booked by another customer. Please select another time.",
          },
          { status: 409 },
        );
      }

      const appointmentId = nanoid();
      const bookingRef = generateBookingRef();
      const historyId = nanoid();

      await client.query(
        `INSERT INTO appointment (
          id, booking_ref, business_id, service_id, staff_id, customer_id,
          start_at, end_at, status,
          service_name, service_duration, service_price,
          staff_name, customer_name, customer_email, customer_phone, notes,
          created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$18)`,
        [
          appointmentId,
          bookingRef,
          svc.businessId,
          data.serviceId,
          data.staffId,
          customerId, // ذخیره شناسه‌ی کاربر متصل
          requestedStart.toISOString(),
          requestedEnd.toISOString(),
          "CONFIRMED",
          svc.name,
          svc.durationMinutes,
          svc.price,
          staff.name,
          data.customerName,
          data.customerEmail,
          data.customerPhone || null,
          data.notes || null,
          new Date().toISOString(),
        ],
      );

      await client.query(
        `INSERT INTO appointment_status_history (id, appointment_id, previous_status, new_status, reason, created_at)
         VALUES ($1, $2, NULL, 'CONFIRMED', 'Booked by customer', $3)`,
        [historyId, appointmentId, new Date().toISOString()],
      );

      await client.query("COMMIT");

      return NextResponse.json(
        {
          success: true,
          bookingRef,
          appointmentId,
          appointment: {
            id: appointmentId,
            bookingRef,
            serviceName: svc.name,
            staffName: staff.name,
            startAt: requestedStart.toISOString(),
            endAt: requestedEnd.toISOString(),
            duration: svc.durationMinutes,
            price: svc.price,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
