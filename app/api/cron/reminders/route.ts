import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointment, notificationLog } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { addHours, subHours } from "date-fns";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

async function handleRemindersCron(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const cronSecret = process.env.CRON_SECRET;

  const authHeader = request.headers.get("authorization");
  const customHeader = request.headers.get("x-cron-secret");
  const querySecret = searchParams.get("key") || searchParams.get("secret");

  const providedSecret =
    authHeader?.replace(/^Bearer\s+/i, "") || customHeader || querySecret;

  if (cronSecret && providedSecret !== cronSecret) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing cron secret." },
      { status: 401 },
    );
  }

  try {
    const now = new Date();
    const windowStart = addHours(now, 23);
    const windowEnd = addHours(now, 25);

    const upcomingAppointments = await db
      .select()
      .from(appointment)
      .where(
        and(
          eq(appointment.status, "CONFIRMED"),
          gte(appointment.startAt, windowStart),
          lte(appointment.startAt, windowEnd),
        ),
      );

    let sentCount = 0;
    let skippedCount = 0;

    for (const apt of upcomingAppointments) {
      const existingLog = await db
        .select({ id: notificationLog.id })
        .from(notificationLog)
        .where(
          and(
            eq(notificationLog.appointmentId, apt.id),
            eq(notificationLog.type, "REMINDER"),
          ),
        )
        .limit(1);

      if (existingLog.length > 0) {
        skippedCount++;
        continue;
      }

      const hasResend = Boolean(process.env.RESEND_API_KEY);

      if (hasResend) {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              AUthorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || "Slotly <noreply@slotly.app>",
              to: [apt.customerEmail],
              subject: `Reminder: ${apt.serviceName} appointment tomorrow`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e5e0; rounded: 12px;">
                  <h2 style="color: #059669;">Appointment Reminder</h2>
                  <p>Hi <strong>${apt.customerName}</strong>,</p>
                  <p>This is a friendly reminder that you have an appointment scheduled for tomorrow:</p>
                  <ul style="line-height: 1.8;">
                    <li><strong>Service:</strong> ${apt.serviceName}</li>
                    <li><strong>Specialist:</strong> ${apt.staffName}</li>
                    <li><strong>Duration:</strong> ${apt.serviceDuration} minutes</li>
                    <li><strong>Booking Reference:</strong> <code>${apt.bookingRef}</code></li>
                  </ul>
                  <p style="margin-top: 20px; color: #6b7280;">See you soon at Slotly!</p>
                </div>
              `,
            }),
          });

          await db.insert(notificationLog).values({
            id: nanoid(),
            appointmentId: apt.id,
            type: "REMINDER",
            recipientEmail: apt.customerEmail,
            status: res.ok ? "SENT" : "FAILED",
          });
        } catch {
          await db.insert(notificationLog).values({
            id: nanoid(),
            appointmentId: apt.id,
            type: "REMINDER",
            recipientEmail: apt.customerEmail,
            status: "FAILED",
          });
        }
      } else {
        console.log(
          `[DEV REMINDER] Sent to: ${apt.customerEmail} | Service: ${apt.serviceName} with ${apt.staffName}`,
        );
        await db.insert(notificationLog).values({
          id: nanoid(),
          appointmentId: apt.id,
          type: "REMINDER",
          recipientEmail: apt.customerEmail,
          status: "SENT",
          metadata: "dev-mode-logged",
        });
      }

      sentCount++;
    }
    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      processed: upcomingAppointments.length,
      sent: sentCount,
      skipped: skippedCount,
    });
  } catch (error) {
    console.error("Reminder cron error:", error);
    return NextResponse.json(
      { error: "Internal server error while processing reminders." },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return handleRemindersCron(request);
}

export async function POST(request: NextRequest) {
  return handleRemindersCron(request);
}
