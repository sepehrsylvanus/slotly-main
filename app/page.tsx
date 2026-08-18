import Link from "next/link";
// import { MarketingHeader } from "@/components/marketing/header";
// import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Shield,
  Sparkles,
  Star,
  Users,
  CalendarCheck,
  ArrowRight,
  CheckCircle2,
  Scissors,
  Heart,
  Zap,
} from "lucide-react";
import MarketingHeader from "@/components/ui/marketing/header";
import MarketingFooter from "@/components/ui/marketing/footer";

const SERVICES_PREVIEW = [
  {
    name: "Classic Cut",
    price: "$55",
    duration: "45 min",
    icon: Scissors,
    category: "Haircuts",
  },
  {
    name: "Signature Fade",
    price: "$65",
    duration: "60 min",
    icon: Sparkles,
    category: "Haircuts",
  },
  {
    name: "Royal Shave",
    price: "$50",
    duration: "45 min",
    icon: Star,
    category: "Beard & Shave",
  },
  {
    name: "Scalp Treatment",
    price: "$60",
    duration: "45 min",
    icon: Heart,
    category: "Wellness",
  },
];

const STEPS = [
  {
    step: 1,
    title: "Choose a Service",
    description: "Browse our menu of premium grooming and wellness services.",
  },
  {
    step: 2,
    title: "Pick Your Professional",
    description:
      "Select a staff member or let us match you with the best available.",
  },
  {
    step: 3,
    title: "Select Date & Time",
    description: "See real-time availability and pick the perfect slot.",
  },
  {
    step: 4,
    title: "Confirm & Relax",
    description:
      "Get instant confirmation and a reminder before your appointment.",
  },
];

const TEAM_PREVIEW = [
  {
    name: "Marcus Rivera",
    role: "Master Barber",
    specialties: "Fades, Textured Cuts",
  },
  {
    name: "Elena Vasquez",
    role: "Barber-Stylist",
    specialties: "Classic Cuts, Shaves",
  },
  { name: "James Chen", role: "Studio Artist", specialties: "Creative Fades" },
];

const TESTIMONIALS = [
  {
    name: "Michael R.",
    text: "Best haircut I have ever had. Marcus understood exactly what I wanted just from a brief description. The online booking made it incredibly easy.",
    rating: 5,
  },
  {
    name: "Sarah K.",
    text: "The Artisan Studio is a cut above. Pun intended. The scalp treatment with Amara was deeply relaxing and my hair has never felt healthier.",
    rating: 5,
  },
  {
    name: "David L.",
    text: "I switched from my old barbershop after trying their signature fade. The skill level here is unmatched, and I love booking through Slotly.",
    rating: 5,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-linear-to-br from-emerald-50 to-background py-20 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant={"secondary"} className="mb-6 px-4 py-1.5 text-sm">
                <Zap className="mr-1.5 h-3.5 w-3.5" />
                Now accepting online bookings
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Your time desreves{" "}
                <span className="bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  precision
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Book appointments with top professionals in seconds. No phone
                calls, no waiting — just seamless scheduling that respects your
                time.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href={"/book"}>
                  <Button
                    size={"xl"}
                    className="w-full shadow-lg shadow-primary/25 sm:w-auto"
                  >
                    Book an Appointment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href={"/services"}>
                  <Button
                    variant={"outline"}
                    size={"xl"}
                    className="w-full sm:w-auto"
                  >
                    View Services
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl" />
          <div className="absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-teal-100/30 blur-3xl" />
        </section>

        {/* Stats */}
        <section className="border-y bg-card py-12">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
            {[
              { value: "2,400+", label: "Happy Clients" },
              { value: "12+", label: "Years Experience" },
              { value: "4.9★", label: "Average Rating" },
              { value: "8", label: "Premium Services" },
            ].map((stat) => (
              <div className="text-center" key={stat.label}>
                <div className="text-2xl font-bold text-primary sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Services */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Our Services
              </h2>
              <p className="mt-3 text-muted-foreground">
                Premium grooming and wellness experiences
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICES_PREVIEW.map((svc) => (
                <Card
                  key={svc.name}
                  className="group transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                      <svc.icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant={"outline"} className="mt-4 text-xs">
                      {svc.category}
                    </Badge>
                    <h3 className="mt-2 text-lg font-semibold">{svc.name}</h3>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="font-semibold text-primary">
                        {svc.price}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {svc.duration}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href={"services"}>
                <Button variant={"outline"} size={"lg"}>
                  View All Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-card py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-3 text-muted-foreground">
                Book your appointment in four simple steps
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-1 lg:grid-cols-4">
              {STEPS.map((step) => (
                <div key={step.step} className="relative text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
                    {step.step}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Preview */}

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Meet Our Professionals
              </h2>
              <p className="mt-3 text-muted-foreground">
                Skilled artists who take pride in their craft
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {TEAM_PREVIEW.map((member) => (
                <Card
                  key={member.name}
                  className="text-center transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-8">
                    <div className="mx-auto flex w-20 h-20 items-center justify-center rounded-full bg-secondary text-2xl font-bold text-primary">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">
                      {member.name}
                    </h3>
                    <p className="text-sm text-primary">{member.role}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {member.specialties}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href={"/team"}>
                <Button variant={"outline"} size={"lg"}>
                  Meet the Full Team
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-card py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                What Our Clients Say
              </h2>
              <p className="mt-3 text-muted-foreground">
                Real reviews from real customers
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <Card
                  key={t.name}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-6">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <p className="mt-4 text-sm font-semibold">{t.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Why Choose Slotly
              </h2>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: CalendarCheck,
                  title: "Real-Time Availability",
                  desc: "See exactly which slots are open. No back-and-forth phone calls.",
                },
                {
                  icon: Shield,
                  title: "No Double Bookings",
                  desc: "Our system uses database-level guarantees to prevent scheduling conflicts.",
                },
                {
                  icon: Clock,
                  title: "Instant Confirmation",
                  desc: "Get your booking confirmed immediately with email details.",
                },
                {
                  icon: Users,
                  title: "Choose Your Professional",
                  desc: "Pick the staff member you prefer or let us find the best match.",
                },
                {
                  icon: Sparkles,
                  title: "Beautiful Experience",
                  desc: "A booking interface as premium as the service you are booking.",
                },
                {
                  icon: CheckCircle2,
                  title: "Easy Management",
                  desc: "Cancel or reschedule online. No phone calls needed.",
                },
              ].map((feat) => (
                <div key={feat.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <feat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feat.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-card py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="mt-12 space-y-6">
              {[
                {
                  q: "How far in advance can I book?",
                  a: "You can book up to 30 days in advance. We recommend booking at least a few days ahead for popular time slots.",
                },
                {
                  q: "What is your cancellation policy?",
                  a: "You can cancel free of charge up to 12 hours before your appointment. Cancellations within 12 hours may be subject to a fee.",
                },
                {
                  q: "Can I reschedule my appointment?",
                  a: "Yes, you can reschedule up to 24 hours before your appointment through your booking confirmation link.",
                },
                {
                  q: "Do I need to create an account?",
                  a: "You can book as a guest with just your email, but creating an account lets you manage all your appointments in one place.",
                },
              ].map((faq) => (
                <div key={faq.q} className="rounded-xl border p-6">
                  <h3 className="font-semibold">{faq.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready for your best look yet?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Book your appointment in under a minute. Real-time availability,
              instant confirmation.
            </p>
            <Link href={"/book"} className="mt-8 inline-block">
              <Button size={"xl"} className="shadow-lg shadow-primary/25">
                Book Your Appointment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
