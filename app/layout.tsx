import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Slotly — Modern Appointment Booking",
  description: "Book appointments with top professionals. Simple, fast, and reliable scheduling for businesses and their clients.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">{children}
      <Toaster position="top-right" richColors/>
      
      </body>
    </html>
  );
}
