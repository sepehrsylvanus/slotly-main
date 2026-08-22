import { db } from "@/db";
import {
  service,
  serviceCategory,
  staffService,
  staffProfile,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import MarketingHeader from "@/components/marketing/header";
import MarketingFooter from "@/components/marketing/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDuration } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Services — Slotly",
  description: "Browse our premium grooming and wellness services.",
};

export default async function ServicesPage() {
  const services = await db
    .select({
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      durationMinutes: service.durationMinutes,
      price: service.price,
      currency: service.currency,
      categoryName: serviceCategory.name,
      categorySlug: serviceCategory.slug,
    })
    .from(service)
    .leftJoin(serviceCategory, eq(service.categoryId, serviceCategory.id))
    .where(eq(service.isActive, true))
    .orderBy(service.sortOrder);

  const servicesWithStaff = await Promise.all(
    services.map(async (svc) => {
      const staff = await db
        .select({ id: staffProfile.id, name: staffProfile.name })
        .from(staffService)
        .innerJoin(staffProfile, eq(staffService.staffId, staffProfile.id))
        .where(
          and(
            eq(staffService.serviceId, svc.id),
            eq(staffProfile.isActive, true),
          ),
        );
      return { ...svc, staffCount: staff.length };
    }),
  );

  const categories = new Map<string, typeof servicesWithStaff>();
  for (const svc of servicesWithStaff) {
    const cat = svc.categoryName || "Other";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(svc);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1 py-12">
        <div className="mx-auto max-x-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Our Services
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Choose from our curated menu of premium grooming and wellness
              experiences
            </p>
          </div>

          <div className="mt-12 space-y-12">
            {Array.from(categories.entries()).map(([categoryName, svcs]) => (
              <div key={categoryName}>
                <h2 className="mb-6 text-xl font-semibold">{categoryName}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {svcs.map((svc) => (
                    <Card
                      key={svc.id}
                      className="group transition-all hover:shadow-md"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">
                              {svc.name}
                            </h3>
                            {svc.description && (
                              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                                {svc.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDuration(svc.durationMinutes)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {svc.staffCount} pro
                            {svc.staffCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(svc.price, svc.currency)}
                          </span>

                          <Link href={`/book?service=${svc.id}`}>
                            <Button size="sm">
                              Book
                              <ArrowRight className="ml-1 h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
