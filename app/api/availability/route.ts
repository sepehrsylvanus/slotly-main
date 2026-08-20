import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  service,
  staffProfile,
  staffService,
  weeklyAvailability,
  breakPeriod,
  timeOff,
  appointment,
  business,
} from "@/db/schema";
import { eq, and, ne, gte, lte } from "drizzle-orm";
import { getAvailableSlots } from "@/features/availability/engin";
import type {
  WorkingHours,
  BreakPeriodData,
  TimeOffData,
  ExistingAppointment,
} from "@/features/availability/engin";
import { parseISO, startOfDay, endOfDay, addDays } from "date-fns";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const staffId = searchParams.get("staffId");
  const dateStr = searchParams.get("date");

  if (!serviceId || !staffId || !dateStr) {
    return NextResponse.json(
      { error: "serviceId, staffId and date are required" },
      { status: 400 },
    );
  }

  const date = parseISO(dateStr);

  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const [svc] = await db
    .select()
    .from(service)
    .where(and(eq(service.id, serviceId), eq(service.isActive, true)));

  if (!svc) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const [biz] = await db
    .select()
    .from(business)
    .where(eq(business.id, svc.businessId));

  if (!biz) {
    if (!biz) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 },
      );
    }
  }

  const [assignment] = await db
    .select()
    .from(staffService)
    .where(
      and(
        eq(staffService.staffId, staffId),
        eq(staffService.serviceId, serviceId),
      ),
    );

  if (!assignment) {
    return NextResponse.json(
      { error: "Staff not assigned to this service" },
      { status: 400 },
    );
  }

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const [workHours, breaks, timeOffs, existingApts] = await Promise.all([
    db
      .select()
      .from(weeklyAvailability)
      .where(eq(weeklyAvailability.staffId, staffId)),
    db.select().from(breakPeriod).where(eq(breakPeriod.staffId, staffId)),
    db.select().from(timeOff).where(eq(timeOff.staffId, staffId)),
    db
      .select()
      .from(appointment)
      .where(
        and(
          eq(appointment.staffId, staffId),
          ne(appointment.status, "CANCELLED"),
          gte(appointment.startAt, dayStart),
          lte(appointment.endAt, addDays(dayEnd, 1)),
        ),
      ),
  ]);

  const slots = getAvailableSlots({
    date,
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

  return NextResponse.json({
    slots: slots.map((s) => ({
      start: s.start.toDateString(),
      end: s.end.toISOString(),
      sidplayTime: s.displayTime,
    })),
    timezone: biz.timezone,
    service: {
      name: svc.name,
      duration: svc.durationMinutes,
      price: svc.price,
    },
  });
}
