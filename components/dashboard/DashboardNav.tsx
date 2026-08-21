"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  LayoutDashboard,
  Scissors,
  Users,
  Settings,
  CalendarDays,
  Home,
  PlusCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface DashboardNavProps {
  user: UserSession;
  children: React.ReactNode;
}

const DashboardNav = ({ user, children }: DashboardNavProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user.role === "ADMIN";

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    {
      href: "/dashboard/appointments",
      label: isAdmin ? "All Appointments" : "My Appointments",
      icon: CalendarDays,
    },
    { href: "/book", label: "Book Appointment", icon: PlusCircle },
    ...(isAdmin
      ? [
          { href: "/dashboard/services", label: "Services", icon: Scissors },
          { href: "/dashboard/staff", label: "Staff", icon: Users },
          { href: "/dashboard/settings", label: "Settings", icon: Settings },
        ]
      : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex h-16 items-center gap-2.5 border-b px-6">
            <Link href={"/"} className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Calendar className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Slotly</span>
            </Link>
          </div>

          <nav
            className="mt-4 space-y-1 px-3"
            aria-label="Dashboard Navigation"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-sidebar-foreground/70 hover:bg-accent hover:text-sidebar-foreground"}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Sidebar Bottom: Profile & Actions */}
        <div className="border-t p-3 space-y-2">
          <div className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {userInitials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground leading-tight">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
              <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wider text-primary">
                {user.role || "CUSTOMER"}
              </span>
            </div>
          </div>
          <Link
            href={"/"}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-accent hover:text-sidebar-foreground"
          >
            <Home className="h-4 w-4" />
            Back to Site
          </Link>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 text-left cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </div>
  );
};

export default DashboardNav;
