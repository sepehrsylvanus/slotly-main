"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  User,
  CalendarDays,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { toast } from "sonner";
import { format, addDays, parseISO } from "date-fns";

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  durationMinutes: number;
  price: string;
  currency: string;
  categoryName: string | null;
  staff: { id: string; name: string; slug: string }[];
}

interface Staff {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  specialties: string | null;
  services: { id: string; name: string }[];
}

interface Slot {
  start: string;
  end: string;
  sidplayTime: string;
}

const STEPS = [
  "Service",

  "Professional",
  "Date & Time",
  "Your Details",
  "Confirm",
];

const BookingWizard = () => {
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingResult, setBookingResult] = useState<{
    bookingRef: string;
    appointment: Record<string, string | number>;
  } | null>(null);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then(setServices)
      .catch(() => toast.error("Failed to load services"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedService) return;
    fetch("/api/staff")
      .then((r) => r.json())
      .then((allStaff: Staff[]) => {
        const eligible = allStaff.filter((s) =>
          s.services.some((svc) => svc.id === selectedService.id),
        );
        setStaffList(eligible);
      })
      .catch(() => toast.error("Failed to load staff"));
  }, [selectedService]);

  useEffect(() => {
    if (!selectedService || !selectedStaff || !selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    fetch(
      `/api/availability?serviceId=${selectedService.id}&staffId=${selectedStaff.id}&date=${selectedDate}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          setSlots([]);
        } else {
          setSlots(data.slots || []);
        }
      })
      .catch(() => {
        toast.error("Failed to load availabality");
        setSlots([]);
      })
      .finally(() => setSlotsLoading(false));
  }, [selectedService, selectedStaff, selectedDate]);

  const handleBook = async () => {
    if (!selectedService || !selectedStaff || !selectedSlot) return;
    setBooking(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          staffId: selectedStaff.id,
          startAt: selectedSlot.start,
          endAt: selectedSlot.end,
          customerName,
          customerEmail,
          customerPhone: customerPhone || undefined,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Booking failed");
        return;
      }
      setBookingResult(data);
      setStep(5);
      toast.success("Appointment booked successfully");
    } catch {
      toast.error("An Unexpected error occured");
    } finally {
      setBooking(false);
    }
  };

  const canGoNext = () => {
    switch (step) {
      case 0:
        return !!selectedService;
      case 1:
        return !!selectedStaff;
      case 2:
        return !!selectedSlot;
      case 3:
        return (
          customerName.length >= 2 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)
        );
      default:
        return false;
    }
  };

  const dateOptions = Array.from({ length: 30 }, (_, i) => {
    const d = addDays(new Date(), i + 1);
    return { value: format(d, "yyyy-MM-dd"), label: format(d, "EEE, MMM d") };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (step === 5 && bookingResult) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-4 text-2xl font-bold">Booking Confirmed</h2>
          <p className="mt-2 text-muted-foreground">
            Your appointment has been scheduled successfully.
          </p>
          <div className="mt-6 rounded-lg bg-muted p-4 text-left text-sm">
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono font-semibold">
                  {bookingResult.bookingRef}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">
                  {selectedService?.name}
                </span>{" "}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Professional</span>
                <span className="font-medium">{selectedStaff?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {selectedDate &&
                    format(parseISO(selectedDate), "EEE, MMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{selectedSlot?.sidplayTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-semibold text-primary">
                  {selectedService &&
                    formatCurrency(
                      selectedService.price,
                      selectedService.currency,
                    )}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            A confirmation email will be sent to{" "}
            <strong>{customerEmail}</strong>
          </p>
          <Button
            className="mt-6 w-full"
            onClick={() => (window.location.href = "/")}
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span className="hidden text-xs font-medium sm:inline">
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-6 ${i < step ? "bg-primary" : "bg-border"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Select Service */}
      {step === 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Select a Service</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {services.map((svc) => (
              <Card
                key={svc.id}
                className={`cursor-pointer transition-all hover:shadow-md ${selectedService?.id === svc.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => {
                  setSelectedService(svc);
                  setSelectedStaff(null);
                  setSelectedSlot(null);
                }}
              >
                <CardContent className="p-4">
                  {svc.categoryName && (
                    <Badge variant={"outline"} className="mb-2 text-xs">
                      {svc.categoryName}
                    </Badge>
                  )}
                  <h3 className="font-semibold">{svc.name}</h3>
                  {svc.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {svc.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary">
                      {formatCurrency(svc.price, svc.currency)}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDuration(svc.durationMinutes)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Select Staff */}
      {step === 1 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Choose a Professional</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {staffList.map((s) => (
              <Card
                key={s.id}
                className={`cursor-pointer transition-all hover:shadow-md ${selectedStaff?.id === s.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => {
                  setSelectedStaff(s);
                  setSelectedSlot(null);
                }}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary">
                    {s.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {s.specialties && (
                        <p className="text-xs text-muted-foreground">
                          {s.specialties}
                        </p>
                      )}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select Date & Time</h2>

          {/* Date picker */}

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Choose a Date
            </label>
            <div className="flex gap-2 overflow-x-auto pb--2">
              {dateOptions.slice(0, 14).map((d) => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDate(d.value)}
                  className={`shrink-0 rounded-lg border px-3 py-2 text-sm transition-colors ${selectedDate === d.value ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Available Times
              </label>
              {slotsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : slots.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No available slots on this date. Please try another day
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {slots.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${selectedSlot?.start === slot.start ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50 hover:bg-secondary"}`}
                    >
                      {slot.sidplayTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Customer Details */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Details</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Full Name *
              </label>

              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Smith"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="john@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium">
                Phone (optional)
              </label>
              <Input
                id="phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                autoComplete="tel"
              />
            </div>
            <div>
              <label htmlFor="notes" className="mb-1 block text-sm font-medium">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests..."
                className="flex min-h-20 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={500}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Review Your Booking</h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground">Professional</span>
                  <span className="font-medium">{selectedStaff?.name}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {selectedDate &&
                      format(parseISO(selectedDate), "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">
                    {selectedSlot?.sidplayTime}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">
                    {selectedService &&
                      formatDuration(selectedService.durationMinutes)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{customerName}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{customerEmail}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary">
                    {selectedService &&
                      formatCurrency(
                        selectedService.price,
                        selectedService.currency,
                      )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation buttons */}
      {step < 5 && (
        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <Button variant={"outline"} onClick={() => setStep(step - 1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canGoNext()}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleBook} disabled={booking}>
              {booking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Booking
                </>
              )}{" "}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingWizard;
