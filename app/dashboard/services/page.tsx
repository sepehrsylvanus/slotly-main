// src/app/dashboard/services/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  service,
  serviceCategory,
  staffProfile,
  staffService,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Scissors, Users } from "lucide-react";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { CreateServiceDialog } from "@/components/dashboard/create-service-dialog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Services - Slotly Dashboard",
};

export default async function ServicesManagementPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [services, categories, staffList] = await Promise.all([
    db
      .select({
        id: service.id,
        name: service.name,
        slug: service.slug,
        description: service.description,
        durationMinutes: service.durationMinutes,
        price: service.price,
        currency: service.currency,
        bufferBefore: service.bufferBefore,
        bufferAfter: service.bufferAfter,
        isActive: service.isActive,
        categoryName: serviceCategory.name,
      })
      .from(service)
      .leftJoin(serviceCategory, eq(service.categoryId, serviceCategory.id))
      .orderBy(service.sortOrder),
    db
      .select({ id: serviceCategory.id, name: serviceCategory.name })
      .from(serviceCategory),

    db
      .select({
        id: staffProfile.id,
        name: staffProfile.name,
        specialties: staffProfile.specialties,
      })
      .from(staffProfile)
      .where(eq(staffProfile.isActive, true)),
  ]);

  const serviceWithStaffCount = await Promise.all(
    services.map(async (svc) => {
      const assignments = await db
        .select({ staffName: staffProfile.name })
        .from(staffService)
        .innerJoin(staffProfile, eq(staffService.staffId, staffProfile.id))
        .where(eq(staffService.serviceId, svc.id));
    }),
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your service offerings, pricing, duration, and staff
            assignments
          </p>
        </div>

        <CreateServiceDialog categories={categories} staff={staffList} />
      </div>

      {serviceWithStaffCount.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed p-12 text-center">
          <Scissors className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-semibold">No services yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first service offering to start accepting appointments.
          </p>
          <div className="mt-4">
            <CreateServiceDialog categories={categories} staff={staffList} />
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceWithStaffCount.map((svc) => (
            <Card key={svc.id}></Card>
          ))}
        </div>
      )}
    </div>
  );
}
