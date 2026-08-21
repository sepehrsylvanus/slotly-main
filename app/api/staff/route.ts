import { NextResponse } from "next/server";
import { db } from "@/db";
import { staffProfile, staffService, service } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const staff = await db
    .select()
    .from(staffProfile)
    .where(eq(staffProfile.isActive, true))
    .orderBy(staffProfile.sortOrder);

  const staffWithServices = await Promise.all(
    staff.map(async (s) => {
      const services = await db
        .select({
          id: service.id,
          name: service.name,
          slug: service.slug,
          durationMinutes: service.durationMinutes,
          price: service.price,
        })
        .from(staffService)
        .innerJoin(service, eq(staffService.serviceId, service.id))
        .where(and(eq(staffService.staffId, s.id), eq(service.isActive, true)));
      return { ...s, services };
    }),
  );

  return NextResponse.json(staffWithServices);
}
