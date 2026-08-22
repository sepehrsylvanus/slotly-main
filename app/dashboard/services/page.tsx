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

      return { ...svc, staff: assignments };
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
            <Card key={svc.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {svc.categoryName && (
                        <Badge variant="outline" className="mb-2 text-xs">
                          {svc.categoryName}
                        </Badge>
                      )}

                      <h3 className="font-semibold text-base leading-snug">
                        {svc.name}
                      </h3>
                    </div>

                    <Badge variant={svc.isActive ? "success" : "secondary"}>
                      {svc.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {svc.description && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {svc.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-primary">
                      {formatCurrency(svc.price, svc.currency)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(svc.durationMinutes)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {svc.staff.length} staff assigned
                    </span>
                    {(svc.bufferBefore > 0 || svc.bufferAfter > 0) && (
                      <span>
                        Buffer: +{svc.bufferBefore + svc.bufferAfter}m
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
