import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import {
  service,
  serviceCategory,
  staffService,
  staffProfile,
  business,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const services = await db
    .select({
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      imageUrl: service.imageUrl,
      durationMinutes: service.durationMinutes,
      price: service.price,
      currency: service.currency,
      bufferBefore: service.bufferBefore,
      bufferAfter: service.bufferAfter,
      isActive: service.isActive,
      sortOrder: service.sortOrder,
      categoryId: service.categoryId,
      categoryName: serviceCategory.name,
    })
    .from(service)
    .leftJoin(serviceCategory, eq(service.categoryId, serviceCategory.id))
    .where(eq(service.isActive, true))
    .orderBy(service.sortOrder);

  const servicesWithStaff = await Promise.all(
    services.map(async (svc) => {
      const staff = await db
        .select({
          id: staffProfile.id,
          name: staffProfile.name,
          slug: staffProfile.slug,
          imageUrl: staffProfile.imageUrl,
        })
        .from(staffService)
        .innerJoin(staffProfile, eq(staffService.staffId, staffProfile.id))
        .where(
          and(
            eq(staffService.serviceId, svc.id),
            eq(staffProfile.isActive, true),
          ),
        );
      return { ...svc, staff };
    }),
  );

  return NextResponse.json(servicesWithStaff);
}
