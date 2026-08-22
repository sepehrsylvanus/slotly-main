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

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin access is required to create services." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      durationMinutes,
      price,
      currency = "USD",
      categoryId,
      bufferBefore = 0,
      bufferAfter = 0,
      isActive = true,
      assignedStaffIds = [],
    } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Service name must be at least 2 characters long." },
        { status: 400 },
      );
    }

    const parsedDuration = parseInt(durationMinutes, 10);
    if (isNaN(parsedDuration) || parsedDuration < 5 || parsedDuration > 480) {
      return NextResponse.json(
        { error: "Duration must be between 5 and 480 minutes." },
        { status: 400 },
      );
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { error: "Price must be a valid non-negative number." },
        { status: 400 },
      );
    }

    const [biz] = await db.select({ id: business.id }).from(business).limit(1);

    const businessId = biz.id || "biz_001";

    const baseSlug = slugify(name) || "service";

    const exsiting = await db
      .select({ id: service.id })
      .from(service)
      .where(
        and(eq(service.businessId, businessId), eq(service.slug, baseSlug)),
      );

    const finalSlug =
      exsiting.length > 0 ? `${baseSlug}-${nanoid(4).toLowerCase()}` : baseSlug;
    const serviceId = `svc_${nanoid(8)}`;

    await db.insert(service).values({
      id: serviceId,
      businessId,
      categoryId: categoryId || null,
      name: name.trim(),
      slug: finalSlug,
      description: description?.trim() || null,
      durationMinutes: parsedDuration,
      price: parsedPrice.toFixed(2),
      currency: currency || "USD",
      bufferBefore: parseInt(bufferBefore, 10) || 0,
      bufferAfter: parseInt(bufferAfter, 10) || 0,
      isActive: Boolean(isActive),
      sortOrder: 0,
    });

    if (Array.isArray(assignedStaffIds) && assignedStaffIds.length > 0) {
      const assignments = assignedStaffIds.map((staffId: string) => ({
        id: nanoid(),
        staffId,
        serviceId,
      }));

      await db.insert(staffService).values(assignments).onConflictDoNothing();
    }

    return NextResponse.json({
      success: true,
      message: "Service created successfully",
      serviceId,
    });
  } catch (error) {
    console.error("Create service error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while creating the service." },
      { status: 500 },
    );
  }
}
