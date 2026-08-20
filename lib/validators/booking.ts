import { z } from "zod";

export const bookingSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  staffId: z.string().min(1, "Staff is required"),
  startAt: z.string().datetime("Invalid start time"),
  endAt: z.string().datetime("Invalid end time"),
  customerName: z.string().min(2, "Name must be at least 2 character"),
  customerEmail: z.string().email("Valid email required"),
  customerPhone: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const rescheduleSchema = z.object({
  appointmentId: z.string().min(1),
  newStartAt: z.string().datetime(),
  newEndAt: z.string().datetime(),
});

export const cancelSchema = z.object({
  appointmentId: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export const servieSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  durationMinutes: z.number().int().min(5).max(480),
  price: z.string().regex(/^\d+\.?\d{0,2}$/, "Invalid price"),

  bufferBefore: z.number().int().min(0).max(60).default(0),
  bufferAfter: z.number().int().min(0).max(60).default(0),
  isActive: z.boolean().default(true),
});

export const staffSchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/),
  bio: z.string().optional(),
  specialties: z.string().optional(),
  isActive: z.boolean().default(true),
});
