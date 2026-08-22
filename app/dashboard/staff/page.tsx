import { db } from "@/db";
import {
  staffProfile,
  staffService,
  service,
  weeklyAvailability,
  timeOff,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Staff - Slotly Dashboard",
};

export default async function StaffManagementPage() {
  const staff = await db
    .select()
    .from(staffProfile)
    .orderBy(staffProfile.sortOrder);

  const staffWithDetails = await Promise.all(
    staff.map(async (s) => {
      const [services, availability, timeOffs] = await Promise.all([
        db
          .select({ id: service.id, name: service.name })
          .from(staffService)
          .innerJoin(service, eq(staffService.serviceId, service.id))
          .where(eq(staffService.staffId, s.id)),

        db
          .select()
          .from(weeklyAvailability)
          .where(
            and(
              eq(weeklyAvailability.staffId, s.id),
              eq(weeklyAvailability.isAvailable, true),
            ),
          ),

        db.select().from(timeOff).where(eq(timeOff.staffId, s.id)),
      ]);

      return {
        ...s,
        services,
        workingDays: availability.length,
        upcomingTimeOffs: timeOffs.length,
      };
    }),
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your team, schedules, and service assignments
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {staffWithDetails.map((member) => (
          <Card key={member.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary text-lg font-bold text-primary">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{member.name}</h3>
                    <Badge variant={member.isActive ? "success" : "secondary"}>
                      {member.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {member.specialties && (
                    <p className="mt-0.5 text-sm text-primary">
                      {member.specialties}
                    </p>
                  )}

                  {member.bio && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {member.bio}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {member.services.map((svc) => (
                      <Badge key={svc.id} variant="outline" className="text-xs">
                        {svc.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                    <span>{member.workingDays} working days/week</span>
                    {member.upcomingTimeOffs > 0 && (
                      <span className="text-amber-600">
                        {member.upcomingTimeOffs} time off scheduled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
