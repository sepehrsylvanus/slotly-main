import Link from "next/link";
import {
  Calendar,
  Home,
  Clock,
  Scissors,
  Users,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "404 — Page Not Found | Slotly",
  description: "The page or time slot you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px]" />

      <div className="relative z-10 mx-auto max-w-xl">
        <div className="mx-auto m-6 flex items-center justify-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary/5 shadow-inner">
            <Clock className="h-6 w-6 animate-pulse" />
          </div>
        </div>

        <span className="inline-block rounded-full bg-secondary px-3.5 py-1 text-xs font-semibold text-secondary-foreground">
          404 • Lost in Time
        </span>

        <h1 className="mt-4 text-7xl font-extrabold tracking-tight text-foreground sm:text-8xl">
          4<span className="text-primary">0</span>4
        </h1>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          This Slot Doesn&apos;t Exist
        </h2>

        <p className="mt-4 text-sm text-muted-foreground sm:text-base leading-relaxed">
          Looks like the page you are looking for has been rescheduled, moved,
          or never existed in our calendar.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2 shadow-sm">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <Link href="/book" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Book Appointment
            </Button>
          </Link>
        </div>

        <div className="mt-12 rounded-2xl border bg-card/60 p-6 text-left shadow-xs backdrop-blur-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Looking for something specific?
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Link
              href="/services"
              className="flex items-center gap-2.5 rounded-lg border bg-background/50 p-3 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-secondary/50"
            >
              <Scissors className="h-4 w-4 text-primary" />
              <span>Services</span>
            </Link>

            <Link
              href="/team"
              className="flex items-center gap-2.5 rounded-lg border bg-background/50 p-3 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-secondary/50"
            >
              <Users className="h-4 w-4 text-primary" />
              <span>Our Team</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 rounded-lg border bg-background/50 p-3 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-secondary/50 col-span-2 sm:col-span-1"
            >
              <LayoutDashboard className="h-4 w-4 text-primary" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Slotly Booking Platform • Powered by Next.js & Drizzle
        </p>
      </div>
    </div>
  );
}
