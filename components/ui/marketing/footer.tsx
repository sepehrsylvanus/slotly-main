import Link from "next/link";
import { Calendar } from "lucide-react";

const MarketingFooter = () => {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Calendar className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Slotly</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Modern appointment booking for forward-thinking businesses.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/services"
                  className="hover:text-foreground transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="hover:text-foreground transition-colors"
                >
                  Our Team
                </Link>
              </li>
              <li>
                <Link
                  href="/book"
                  className="hover:text-foreground transition-colors"
                >
                  Book Now
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Support</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Contact</h4>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>142 West Broadway</p>
              <p>New York, NY 10013</p>
              <p>hello@artisanstudio.com</p>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Slotly. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default MarketingFooter;
