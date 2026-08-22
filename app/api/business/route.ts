import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { business } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const businesses = await db.select().from(business).limit(1);
  const biz = businesses[0] || null;
  return NextResponse.json({ business: biz });
}

export async function PATCH(request: NextResponse) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Forbidden. Admin access is required to update business settings.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const [biz] = await db.select().from(business).limit(1);
    if (!biz) {
      return NextResponse.json(
        { error: "No business record found to update" },
        { status: 404 },
      );
    }

    const name = body.name?.trim();
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Business name must be at least 2 characters long." },
        { status: 400 },
      );
    }

    const slotInterval = parseInt(body.slotInterval, 10);
    if (isNaN(slotInterval) || slotInterval < 5 || slotInterval > 120) {
      return NextResponse.json(
        { error: "Slot interval must be between 5 and 120 minutes." },
        { status: 400 },
      );
    }

    const minBookingNotice = parseInt(body.minBookingNotice, 10);
    if (isNaN(minBookingNotice) || minBookingNotice < 0) {
      return NextResponse.json(
        { error: "Min booking notice must be a non-negative number." },
        { status: 400 },
      );
    }

    const maxAdvanceBookingDays = parseInt(body.maxAdvanceBookingDays, 10);
    if (
      isNaN(maxAdvanceBookingDays) ||
      maxAdvanceBookingDays < 1 ||
      maxAdvanceBookingDays > 365
    ) {
      return NextResponse.json(
        { error: "Max advance booking days must be between 1 and 365." },
        { status: 400 },
      );
    }

    const cancellationCutoffHours = parseInt(body.cancellationCutoffHours, 10);
    if (isNaN(cancellationCutoffHours) || cancellationCutoffHours < 0) {
      return NextResponse.json(
        { error: "Cancellation cutoff must be a non-negative number." },
        { status: 400 },
      );
    }

    const rescheduleCutoffHours = parseInt(body.rescheduleCutoffHours, 10);
    if (isNaN(rescheduleCutoffHours) || rescheduleCutoffHours < 0) {
      return NextResponse.json(
        { error: "Reschedule cutoff must be a non-negative number." },
        { status: 400 },
      );
    }

    await db
      .update(business)
      .set({
        name,
        description: body.description?.trim() || null,
        timezone: body.timezone?.trim() || "America/New_York",
        currency: body.currency?.trim() || "USD",
        contactEmail: body.contactEmail?.trim() || null,
        contactPhone: body.contactPhone?.trim() || null,
        address: body.address?.trim() || null,
        slotInterval,
        minBookingNotice,
        maxAdvanceBookingDays,
        cancellationCutoffHours,
        rescheduleCutoffHours,
        updatedAt: new Date(),
      })
      .where(eq(business.id, biz.id));

    const [updatedBiz] = await db
      .select()
      .from(business)
      .where(eq(business.id, biz.id));

    return NextResponse.json({
      success: true,
      message: "Business settings updated successfully",
      business: updatedBiz,
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while saving settings." },
      { status: 500 },
    );
  }
}
