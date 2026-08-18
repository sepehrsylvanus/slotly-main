import Link from "next/link";
import { Calendar, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const MarketingHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={"/"} className="flex items-center  gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </div>
        </Link>

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

        <div className="flex items-center gap-3">
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
        </div>
      </div>
    </header>
  );
};

export default MarketingHeader;
