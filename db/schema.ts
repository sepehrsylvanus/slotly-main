import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("CUSTOMER"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  issuer: text("issuer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Enums ───────────────────────────────────────────────────────────
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);

export const dayOfWeekEnum = pgEnum("day_of_week", [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

// ── Business ────────────────────────────────────────────────────────

export const business = pgTable("business", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  timezone: text("timezone").notNull().default("America/New_York"),
  currency: text("currency").notNull().default("USD"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  logoUrl: text("logo_url"),
  slotInterval: integer("slot_interval").notNull().default(15),
  minBookingNotice: integer("min_booking_notice").notNull().default(30),
  maxAdvanceBookingDays: integer("days").notNull().default(30),
  cancellationCutoffHours: integer("cancellation_cutoff_hours")
    .notNull()
    .default(12),
  rescheduleCutoffHours: integer("reschedule_cutoff_hours")
    .notNull()
    .default(24),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Service Category ────────────────────────────────────────────────
export const serviceCategory = pgTable("service_category", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => business.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Service ─────────────────────────────────────────────────────────
export const service = pgTable(
  "service",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "cascade" }),
    categoryId: text("category_id").references(() => serviceCategory.id),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    durationMinutes: integer("duration_minutes").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USD"),
    bufferBefore: integer("buffer_before").notNull().default(0),
    bufferAfter: integer("buffer_after").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("service_business_slug_idx").on(table.businessId, table.slug),
  ],
);

// ── Staff Profile ───────────────────────────────────────────────────
export const staffProfile = pgTable("staff_profile", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => business.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  bio: text("bio"),
  imageUrl: text("image_url"),
  specialties: text("specialties"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Staff ↔ Service join ────────────────────────────────────────────
export const staffService = pgTable(
  "staff_service",
  {
    id: text("id").primaryKey(),
    staffId: text("staff_id")
      .notNull()
      .references(() => staffProfile.id, { onDelete: "cascade" }),
    serviceId: text("service_id")
      .notNull()
      .references(() => service.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("staff_service_unique_idx").on(table.staffId, table.serviceId),
  ],
);

// ── Weekly Availability ─────────────────────────────────────────────
export const weeklyAvailability = pgTable("weekly_availability", {
  id: text("id").primaryKey(),
  staffId: text("staff_id")
    .notNull()
    .references(() => staffProfile.id, { onDelete: "cascade" }),
  dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "17:00"
  isAvailable: boolean("is_available").notNull().default(true),
});

// ── Break Period ────────────────────────────────────────────────────
export const breakPeriod = pgTable("break_period", {
  id: text("id").primaryKey(),
  staffId: text("staff_id")
    .notNull()
    .references(() => staffProfile.id, { onDelete: "cascade" }),
  dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
});

// ── Time Off ────────────────────────────────────────────────────────
export const timeOff = pgTable("time_off", {
  id: text("id").primaryKey(),
  staffId: text("staff_id")
    .notNull()
    .references(() => staffProfile.id, { onDelete: "cascade" }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Appointment ─────────────────────────────────────────────────────
export const appointment = pgTable(
  "appointment",
  {
    id: text("id").primaryKey(),
    bookingRef: text("booking_ref").notNull().unique(),
    businessId: text("business_id")
      .notNull()
      .references(() => business.id),

    serviceId: text("service_id")
      .notNull()
      .references(() => service.id),

    staffId: text("staff_id")
      .notNull()
      .references(() => staffProfile.id),

    customerId: text("customer_id").references(() => user.id),

    // UTC timestamps
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    status: appointmentStatusEnum("status").notNull().default("PENDING"),

    // Snapshot fields for historical accuracy
    serviceName: text("service_name").notNull(),
    serviceDuration: integer("service_duration").notNull(),
    servicePrice: numeric("service_price", {
      precision: 10,
      scale: 2,
    }).notNull(),
    staffName: text("staff_name").notNull(),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("appointment_staff_time_idx").on(
      table.staffId,
      table.startAt,
      table.endAt,
    ),
    index("appointment_customer_idx").on(table.customerId),
    index("appointment_business_idx").on(table.businessId),
    index("appointment_status_idx").on(table.status),
  ],
);

// ── Appointment Status History ──────────────────────────────────────
export const appointmentStatusHistory = pgTable("appointment_status_history", {
  id: text("id").primaryKey(),
  appointmentId: text("appointment_id")
    .notNull()
    .references(() => appointment.id, { onDelete: "cascade" }),
  previousStatus: appointmentStatusEnum("previous_status"),
  newStatus: appointmentStatusEnum("new_status").notNull(),
  changedBy: text("changed_by").references(() => user.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Notification Log ────────────────────────────────────────────────
export const notificationLog = pgTable("notification_log", {
  id: text("id").primaryKey(),
  appointmentId: text("appointment_id").references(() => appointment.id),
  type: text("type").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  status: text("status").notNull().default("SENT"),
  metadata: text("metadata"),
});

// ── Relations ───────────────────────────────────────────────────────
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  appointments: many(appointment, { relationName: "customerAppointments" }),
}));

export const sessionnRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.id], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const businessRelations = relations(business, ({ many }) => ({
  services: many(service),
  categories: many(serviceCategory),
  staff: many(staffProfile),
  appointments: many(appointment),
}));

export const serviceCategoryRelations = relations(
  serviceCategory,
  ({ one, many }) => ({
    business: one(business, {
      fields: [serviceCategory.businessId],
      references: [business.id],
    }),
    services: many(service),
  }),
);

export const serviceRelations = relations(service, ({ one, many }) => ({
  business: one(business, {
    fields: [service.businessId],
    references: [business.id],
  }),
  category: one(serviceCategory, {
    fields: [service.categoryId],
    references: [serviceCategory.id],
  }),
  staffServices: many(staffService),
  appointments: many(appointment),
}));

export const staffProfileRelations = relations(
  staffProfile,
  ({ one, many }) => ({
    business: one(business, {
      fields: [staffProfile.businessId],
      references: [business.id],
    }),
    user: one(user, { fields: [staffProfile.userId], references: [user.id] }),
    staffServices: many(staffService),
    availability: many(weeklyAvailability),
    breaks: many(breakPeriod),
    timeOffs: many(timeOff),
    appointments: many(appointment),
  }),
);

export const staffServiceRelations = relations(staffService, ({ one }) => ({
  staff: one(staffProfile, {
    fields: [staffService.staffId],
    references: [staffProfile.id],
  }),
  service: one(service, {
    fields: [staffService.serviceId],
    references: [service.id],
  }),
}));

export const weeklyAvailabilityRelations = relations(
  weeklyAvailability,
  ({ one }) => ({
    staff: one(staffProfile, {
      fields: [weeklyAvailability.staffId],
      references: [staffProfile.id],
    }),
  }),
);

export const breakPeriodRelations = relations(breakPeriod, ({ one }) => ({
  staff: one(staffProfile, {
    fields: [breakPeriod.staffId],
    references: [staffProfile.id],
  }),
}));

export const timeOffRelations = relations(timeOff, ({ one }) => ({
  staff: one(staffProfile, {
    fields: [timeOff.staffId],
    references: [staffProfile.id],
  }),
}));

export const appointmentRelations = relations(appointment, ({ one, many }) => ({
  business: one(business, {
    fields: [appointment.businessId],
    references: [business.id],
  }),
  service: one(service, {
    fields: [appointment.serviceId],
    references: [service.id],
  }),
  staff: one(staffProfile, {
    fields: [appointment.staffId],
    references: [staffProfile.id],
  }),
  customer: one(user, {
    fields: [appointment.customerId],
    references: [user.id],
    relationName: "customerAppointments",
  }),
  statusHistory: many(appointmentStatusHistory),
}));

export const appointmentStatusHistoryRelations = relations(
  appointmentStatusHistory,
  ({ one }) => ({
    appointment: one(appointment, {
      fields: [appointmentStatusHistory.appointmentId],
      references: [appointment.id],
    }),
  }),
);
