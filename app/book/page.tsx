import MarketingHeader from "@/components/marketing/header";
import MarketingFooter from "@/components/marketing/footer";
import BookingWizard from "@/components/booking/booking-wizard";

export const metadata = {
  title: "Book an Appointment - Slotly",
  description:
    "Select your service, professional, and preferred time to book an appointment.",
};

export default function BookPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:-x-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Book Your Appointment
            </h1>
            <p className="mt-2 text-muted-foreground">
              Follow the steps below to schedule your visit
            </p>
          </div>
          <div className="mt-8">
            <BookingWizard />
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
