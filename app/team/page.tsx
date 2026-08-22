import { db } from "@/db";
import { staffProfile, staffService, service } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import MarketingHeader from "@/components/marketing/header";
import MarketingFooter from "@/components/marketing/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Our Team — Slotly",
  description: "Meet the skilled professionals behind The Artisan Studio.",
};

export default async function TeamPage() {
  const staff = await db
    .select()
    .from(staffProfile)
    .where(eq(staffProfile.isActive, true))
    .orderBy(staffProfile.sortOrder);

  const staffWithServices = await Promise.all(
    staff.map(async (s) => {
      const services = await db
        .select({ id: service.id, name: service.name })
        .from(staffService)
        .innerJoin(service, eq(staffService.serviceId, service.id))
        .where(and(eq(staffService.staffId, s.id), eq(service.isActive, true)));
      return { ...s, services };
    }),
  );

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Our Professionals
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Each team member brings a unique set of skills and passion for
              their craft
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {staffWithServices.map((member) => (
              <Card
                key={member.id}
                className="overflow-hidden transition-shadow hover:shadow-md"
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-secondary text-2xl font-bold text-primary">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{member.name}</h3>
                      {member.specialties && (
                        <p className="mt-1 text-sm text-primary">
                          {member.specialties}
                        </p>
                      )}
                      {member.bio && (
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {member.bio}
                        </p>
                      )}
                      {member.services.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {member.services.map((svc) => (
                            <Badge
                              key={svc.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {svc.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Link
                        href={`/book?staff=${member.id}`}
                        className="mt-4 inline-block"
                      >
                        <Button size="sm" variant="outline">
                          Book with {member.name.split(" ")[0]}
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
