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
  cancelleationCutoffHours: number;
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
  return <div>BusinessSettingForm</div>;
};

export default BusinessSettingForm;
