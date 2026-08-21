// src/app/dashboard/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { appointment } from "@/db/schema";
import { and, gte, count, sql, or, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  DollarSign,
  Clock,
  CalendarCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard — Slotly",
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

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const now = new Date();
  const isAdmin = session.user.role === "ADMIN";

  // اگر ادمین بود تمام نوبت‌ها، اگر مشتری بود فقط نوبت‌های خودش را می‌بیند
  const filterCondition = isAdmin
    ? sql`1=1`
    : or(
        eq(appointment.customerId, session.user.id),
        eq(appointment.customerEmail, session.user.email),
      );

  const [
    upcomingApts,
    completedApts,
    totalApts,
    totalSpentRes,
    recentAppointments,
  ] = await Promise.all([
    db
      .select({ count: count() })
      .from(appointment)
      .where(
        and(
          filterCondition,
          gte(appointment.startAt, now),
          sql`${appointment.status} IN ('CONFIRMED', 'PENDING')`,
        ),
      ),
    db
      .select({ count: count() })
      .from(appointment)
      .where(and(filterCondition, sql`${appointment.status} = 'COMPLETED'`)),
    db.select({ count: count() }).from(appointment).where(filterCondition),
    db
      .select({
        total: sql<string>`COALESCE(SUM(${appointment.servicePrice}::numeric), 0)`,
      })
      .from(appointment)
      .where(and(filterCondition, sql`${appointment.status} != 'CANCELLED'`)),
    db
      .select()
      .from(appointment)
      .where(filterCondition)
      .orderBy(sql`${appointment.startAt} DESC`)
      .limit(10),
  ]);

  const stats = [
    {
      label: "Upcoming Appointments",
      value: upcomingApts[0].count,
      icon: CalendarDays,
      color: "text-blue-600",
    },
    {
      label: "Completed Visits",
      value: completedApts[0].count,
      icon: CheckCircle2,
      color: "text-emerald-600",
    },
    {
      label: "Total Bookings",
      value: totalApts[0].count,
      icon: CalendarCheck,
      color: "text-purple-600",
    },
    {
      label: isAdmin ? "Total Revenue" : "Total Spent",
      value: formatCurrency(totalSpentRes[0].total),
      icon: DollarSign,
      color: "text-amber-600",
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {session.user.name.split(" ")[0]}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {format(now, "EEEE, MMMM d, yyyy")} •{" "}
            {isAdmin ? "Admin Overview" : "Your personal booking dashboard"}
          </p>
        </div>
        <Link href="/book">
          <Button>Book Appointment</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${stat.color}`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Appointments */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Appointments</CardTitle>
          <Link
            href="/dashboard/appointments"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {recentAppointments.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <CalendarDays className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium text-foreground">
                No appointments found
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                You haven&apos;t booked any appointments yet.
              </p>
              <Link href="/book" className="mt-4 inline-block">
                <Button size="sm">
                  Book Your First Appointment
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                      {(isAdmin ? apt.customerName : apt.staffName)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{apt.serviceName}</p>
                      <p className="text-xs text-muted-foreground">
                        {isAdmin
                          ? `Customer: ${apt.customerName} • Staff: ${apt.staffName}`
                          : `with ${apt.staffName}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(new Date(apt.startAt), "MMM d, h:mm a")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {apt.serviceDuration} min •{" "}
                        {formatCurrency(apt.servicePrice)}
                      </p>
                    </div>
                    <Badge variant={STATUS_COLORS[apt.status] || "secondary"}>
                      {apt.status}
                    </Badge>
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
