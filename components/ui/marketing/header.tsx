"use client";
import Link from "next/link";
import { Calendar, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const MarketingHeader = () => {
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={"/"} className="flex items-center  gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </div>
        </Link>

        {/* Desktop Navigation */}

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Main navigation"
        >
          <Link
            href="/services"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Services
          </Link>
          <Link
            href="/team"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Team
          </Link>
          <Link
            href="/book"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Book Now
          </Link>
        </nav>

        {/* Desktop Auth & Actions */}
        <div className="hidden  items-center gap-3 md:flex">
          {!isPending && session?.user ? (
            <>
              <Link href="/dashboard">
                <Button variant={"outline"} size={"sm"} className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>

              <Button
                variant={"ghost"}
                size={"sm"}
                onClick={handleSignOut}
                className="gap-1.5 text-muted-foreground hover:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/sign-in" className="hidden md:block">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/book">
                <Button size="sm" className="shadow-sm">
                  Book Appointment
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Actions & Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant={"ghost"}
            size={"sm"}
            className="p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}

      {mobileMenuOpen && (
        <div className="border-b bg-card px-4 py-4 md:hidden animate-in slide-in-from-top-2 shadow-lg flex flex-col">
          <Link
            href={"/services"}
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
          >
            Services
          </Link>
          <Link
            href="/team"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
          >
            Team
          </Link>
          <Link
            href="/book"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
          >
            Book Now
          </Link>

          <div className="pt-3 border-t space-y-2">
            {!isPending && session?.user ? (
              <>
                <div className="rounded-lg bg-muted/60 p-2.5">
                  <p className="text-sm font-semibold truncate leading-tight">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                  <Link
                    href={"/dashboard"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted"
                  >
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg text-left cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="grid gap-2 pt-1">
                <Link
                  href="/auth/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <Button variant="outline" className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link
                  href="/book"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <Button className="w-full justify-center">
                    Book Appointment
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default MarketingHeader;
