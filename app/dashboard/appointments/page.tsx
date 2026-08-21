import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { appointment } from "@/db/schema";
import { sql, eq, or } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Appointments - Sloty Dashboard",
};

const STATUS_COLORS: Record<
  string,
  "default" | "success" | "warning" | "destructive" | "secondary"
> = {
  PENDING: "warning",
  CONFIRMED: "default",
  COMPLETED: "success",
  CANCELLED: "destructive",
  NO_SHOW: "secondary",
};

export default async function AppointmentsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const isAdmin = session.user.role === "ADMIN";

  const filterCondition = isAdmin
    ? sql`1=1`
    : or(
        eq(appointment.customerId, session.user.id),
        eq(appointment.customerEmail, session.user.email),
      );

  const appointments = await db
    .select()
    .from(appointment)
    .where(filterCondition)
    .orderBy(sql`${appointment.startAt} DESC`)
    .limit(50);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isAdmin ? "All appointments" : "My Appointments"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin
              ? "Manage all bookings across the business"
              : "View and manage your upcoming and past bookings"}
          </p>
        </div>

        <Link href={"/book"}>
          <Button size={"sm"}>
            <Plus className="mr-1.5 h-4 w-4" />
            Book New
          </Button>
        </Link>
      </div>

      <Card className="mt-6">
        <CardContent className="p-8">
          {appointments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">
                No appointments yet
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {isAdmin
                  ? "Appointments will appear here once customers start booking."
                  : "You haven't made any bookings yet."}
              </p>

              {!isAdmin && (
                <Link href="/book" className="mt-4 inline-block">
                  <Button size="sm">Book an Appointment</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                      {(isAdmin ? apt.customerName : apt.staffName)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium">{apt.serviceName}</p>
                      <p className="text-sm text-muted-foreground">
                        {isAdmin
                          ? `Customer: ${apt.customerName} • Staff: ${apt.staffName}`
                          : `with ${apt.staffName} `}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {apt.customerEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(new Date(apt.startAt), "MMM d, yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(apt.startAt), "h:mm a")} —{" "}
                        {format(new Date(apt.endAt), "h:mm a")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">
                        {formatCurrency(apt.servicePrice)}
                      </p>
                      <Badge
                        variant={STATUS_COLORS[apt.status] || "secondary"}
                        className="mt-1"
                      >
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="w-24 text-right">
                      <p className="font-mono text-xs text-muted-foreground">
                        {apt.bookingRef}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
