"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Clock,
  Globe,
  Mail,
  Phone,
  MapPin,
  Pencil,
  X,
  Loader2,
  Calendar,
  AlertCircle,
  Save,
} from "lucide-react";
import { toast } from "sonner";

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  timezone: string;
  currency: string;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  slotInterval: number;
  minBookingNotice: number;
  maxAdvanceBookingDays: number;
  cancellationCutoffHours: number;
  rescheduleCutoffHours: number;
}

interface BusinessSettingsFormProps {
  initialData: BusinessData;
}

const COMMON_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tehran",
  "Asia/Dubai",
  "Asia/Tokyo",
  "UTC",
];

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "IRR"];

const BusinessSettingForm = ({ initialData }: BusinessSettingsFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<BusinessData>(initialData);
  const [formData, setFormData] = useState<BusinessData>(initialData);
  const router = useRouter();

  const handleStartEdit = () => {
    setFormData(data);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData(data);
    setIsEditing(false);
  };

  const handleChange = (field: keyof BusinessData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Business name is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/business", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to update settings");
        return;
      }
      toast.success("Business settings updated successfully!");

      if (result.business) {
        setData(result.business);
        setFormData(result.business);
      } else {
        setData(formData);
      }
      setIsEditing(false);
      router.refresh;
    } catch (error) {
      toast.error("An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Business Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEditing
              ? "Modify your booking policies, schedule intervals, and store details."
              : "View and configure your booking policies and business information."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button onClick={handleStartEdit} className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit Settings
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={saving}
                className="gap-1.5"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {!isEditing && (
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                General Information
              </CardTitle>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Business Name
                      </p>
                      <p className="text-sm font-semibold">{data.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Contact Email
                      </p>
                      <p className="text-sm font-medium">
                        {data.contactEmail || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Contact Phone
                      </p>
                      <p className="text-sm font-medium">
                        {data.contactPhone || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm font-medium">
                        {data.address || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {data.description && (
                  <div className="mt-4 rounded-lg bg-muted/40 p-3.5 border">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      About the Studio / Business
                    </p>
                    <p className="text-xs text-foreground leading-relaxed">
                      {data.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Booking & Schedule Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <Globe className="h-4 w-4 text-muted-foreground" />

                  <div>
                    <p className="text-xs text-muted-foreground">Time Zone</p>
                    <p className="text-sm font-medium">{data.timezone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <div className="flex h-5 w-5 items-center justify-center text-xs font-bold text-muted-foreground">
                    $
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Currency</p>
                    <p className="text-sm font-medium">{data.currency}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Slot Interval
                    </p>
                    <p className="text-sm font-medium">
                      {data.slotInterval} minutes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Min Booking Notice
                    </p>
                    <p className="text-xs font-medium">
                      {data.minBookingNotice >= 60
                        ? `${Math.round(data.minBookingNotice / 60)} hourse`
                        : `${data.minBookingNotice} minutes`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Max Advance Booking
                    </p>
                    <p className="text-sm font-medium">
                      {data.maxAdvanceBookingDays} days
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Cancellation Cutoff
                    </p>
                    <p className="text-sm font-medium">
                      {data.cancellationCutoffHours} hours
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Reschedule Cutoff
                    </p>
                    <p className="text-sm font-medium">
                      {data.rescheduleCutoffHours} hours
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleSave} className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                General Information
              </CardTitle>
              <CardDescription>
                Basic details about your business displayed on the booking page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="edit-name"
                    className="mb-1.5 block text-xs font-semibold text-foreground"
                  >
                    Business Name *
                  </label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. The Artisan Studio"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-email"
                    className="mb-1.5 block text-xs font-semibold text-foreground"
                  >
                    Contact Email
                  </label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.contactEmail || ""}
                    onChange={(e) =>
                      handleChange("contactEmail", e.target.value)
                    }
                    placeholder="hello@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-phone"
                    className="mb-1.5 block text-xs font-semibold text-foreground"
                  >
                    Contact Phone
                  </label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={formData.contactPhone || ""}
                    onChange={(e) =>
                      handleChange("contactPhone", e.target.value)
                    }
                    placeholder="+1 (555) 0147"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-address"
                    className="mb-1.5 block text-xs font-semibold text-foreground"
                  >
                    Physical Address
                  </label>
                  <Input
                    id="edit-address"
                    value={formData.address || ""}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="142 West Broadway, New York, NY"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-desc"
                  className="mb-1.5 block text-xs font-semibold text-foreground"
                >
                  Business Description
                </label>
                <textarea
                  id="edit-desc"
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Tell customers about your studio, expertise, and atmosphere..."
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Booking & Schedule Configuration
              </CardTitle>
              <CardDescription>
                Define booking intervals, advance reservation windows, and
                cancellation rules.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label
                    htmlFor="edit-timezone"
                    className="mb-1.5 block text-xs font-semibold text-foreground"
                  >
                    Time Zone *
                  </label>

                  <select
                    id="edit-timezone"
                    value={formData.timezone}
                    onChange={(e) => handleChange("timezone", e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {COMMON_TIMEZONES.map((tz) => (
                      <option value={tz} key={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="edit-currency"
                    className="mb-1.5 block text-xs font-semibold text-foreground"
                  >
                    Currency *
                  </label>
                  <select
                    id="edit-currency"
                    value={formData.currency}
                    onChange={(e) => handleChange("currency", e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="edit-slotInterval"
                    className="mb-1.5 block text-xs font-semibold text-foreground"
                  >
                    Slot Interval (minutes) *
                  </label>
                  <select
                    id="edit-slotInterval"
                    value={formData.slotInterval}
                    onChange={(e) =>
                      handleChange("slotInterval", parseInt(e.target.value, 10))
                    }
                    className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes (Standard)</option>
                    <option value={20}>20 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="edit-notice"
                    className="mb-1.5 block text-xs font-semibold text-foreground"
                  >
                    Min Booking Notice (minutes) *
                  </label>

                  <Input
                    id="edit-notice"
                    type="number"
                    min={"0"}
                    step={"15"}
                    value={formData.minBookingNotice}
                    onChange={(e) =>
                      handleChange(
                        "minBookingNotice",
                        parseInt(e.target.value, 10) || 0,
                      )
                    }
                    required
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    e.g. 60 = minimum 1 hour in advance
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="edit-advance"
                    className="mb-1.5 block text-xs font-semibold text-foreground"
                  >
                    Max Advance Booking (days) *
                  </label>
                  <Input
                    id="edit-advance"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.maxAdvanceBookingDays}
                    onChange={(e) =>
                      handleChange(
                        "maxAdvanceBookingDays",
                        parseInt(e.target.value, 10) || 1,
                      )
                    }
                    required
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    How far ahead customers can book
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="edit-cancellation"
                    className="mb-1.5 block text-xs font-semibold text-foreground"
                  >
                    Cancellation Cutoff (hours) *
                  </label>
                  <Input
                    id="edit-cancellation"
                    type="number"
                    min="0"
                    max="168"
                    value={formData.cancellationCutoffHours}
                    onChange={(e) =>
                      handleChange(
                        "cancellationCutoffHours",
                        parseInt(e.target.value, 10) || 0,
                      )
                    }
                    required
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Minimum hours before appointment to cancel
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="edit-reschedule"
                    className="mb-1.5 block text-xs font-semibold text-foreground"
                  >
                    Reschedule Cutoff (hours) *
                  </label>
                  <Input
                    id="edit-reschedule"
                    type="number"
                    min="0"
                    max="168"
                    value={formData.rescheduleCutoffHours}
                    onChange={(e) =>
                      handleChange(
                        "rescheduleCutoffHours",
                        parseInt(e.target.value, 10) || 0,
                      )
                    }
                    required
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Minimum hours before appointment to reschedule
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant={"outline"}
              onClick={handleCancelEdit}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BusinessSettingForm;
