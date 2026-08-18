import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  business,
  serviceCategory,
  service,
  staffProfile,
  staffService,
  weeklyAvailability,
  breakPeriod,
  timeOff,
  appointment,
  appointmentStatusHistory,
  user,
  account,
} from "./schema";
import { nanoid } from "nanoid";
import { addDays, addHours, setHours, setMinutes, subDays } from "date-fns";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

async function seed() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle(pool);

  console.log("🌱 Seeding Slotly database...");

  // ── Business ──────────────────────────────────────────────
  const bizId = "biz_001";
  await db
    .insert(business)
    .values({
      id: bizId,
      name: "The Artisan Studio",
      slug: "the-artisan-studio",
      description:
        "Premium grooming & wellness studio in downtown Manhattan. We blend traditional barbering techniques with modern aesthetics.",
      timezone: "America/New_York",
      currency: "USD",
      contactEmail: "hello@artisanstudio.com",
      contactPhone: "+1 (212) 555-0147",
      address: "142 West Broadway, New York, NY 10013",
      slotInterval: 15,
      minBookingNotice: 60,
      maxAdvanceBookingDays: 30,
      cancellationCutoffHours: 12,
      rescheduleCutoffHours: 24,
    })
    .onConflictDoNothing();

  // ── Categories ────────────────────────────────────────────
  const catHaircuts = "cat_001";
  const catBeard = "cat_002";
  const catWellness = "cat_003";

  await db
    .insert(serviceCategory)
    .values([
      {
        id: catHaircuts,
        businessId: bizId,
        name: "Haircuts",
        slug: "haircuts",
        sortOrder: 1,
      },
      {
        id: catBeard,
        businessId: bizId,
        name: "Beard & Shave",
        slug: "beard-shave",
        sortOrder: 2,
      },
      {
        id: catWellness,
        businessId: bizId,
        name: "Wellness",
        slug: "wellness",
        sortOrder: 3,
      },
    ])
    .onConflictDoNothing();

  // ── Services ──────────────────────────────────────────────
  const services = [
    {
      id: "svc_001",
      businessId: bizId,
      categoryId: catHaircuts,
      name: "Classic Cut",
      slug: "classic-cut",
      description:
        "A refined haircut tailored to your face shape and hair type. Includes consultation, shampoo, cut, and style.",
      durationMinutes: 45,
      price: "55.00",
      bufferBefore: 0,
      bufferAfter: 10,
      sortOrder: 1,
    },
    {
      id: "svc_002",
      businessId: bizId,
      categoryId: catHaircuts,
      name: "Signature Fade",
      slug: "signature-fade",
      description:
        "Our most popular cut. Precision fade with textured top, finished with hot towel and styling product.",
      durationMinutes: 60,
      price: "65.00",
      bufferBefore: 0,
      bufferAfter: 10,
      sortOrder: 2,
    },
    {
      id: "svc_003",
      businessId: bizId,
      categoryId: catHaircuts,
      name: "Buzz Cut",
      slug: "buzz-cut",
      description: "Clean, low-maintenance buzz with lineup. Quick and sharp.",
      durationMinutes: 30,
      price: "35.00",
      bufferBefore: 0,
      bufferAfter: 5,
      sortOrder: 3,
    },
    {
      id: "svc_004",
      businessId: bizId,
      categoryId: catBeard,
      name: "Beard Sculpt",
      slug: "beard-sculpt",
      description:
        "Precision beard shaping with straight razor edges, hot towel, and beard oil treatment.",
      durationMinutes: 30,
      price: "35.00",
      bufferBefore: 0,
      bufferAfter: 5,
      sortOrder: 4,
    },
    {
      id: "svc_005",
      businessId: bizId,
      categoryId: catBeard,
      name: "Royal Shave",
      slug: "royal-shave",
      description:
        "Traditional straight razor shave with pre-shave oil, hot lather, and cold towel finish.",
      durationMinutes: 45,
      price: "50.00",
      bufferBefore: 5,
      bufferAfter: 10,
      sortOrder: 5,
    },
    {
      id: "svc_006",
      businessId: bizId,
      categoryId: catWellness,
      name: "Scalp Treatment",
      slug: "scalp-treatment",
      description:
        "Deep scalp massage with essential oils, exfoliation, and hydrating treatment. Relieves stress and promotes hair health.",
      durationMinutes: 45,
      price: "60.00",
      bufferBefore: 5,
      bufferAfter: 5,
      sortOrder: 6,
    },
    {
      id: "svc_007",
      businessId: bizId,
      categoryId: catHaircuts,
      name: "Kids Cut",
      slug: "kids-cut",
      description:
        "Friendly, patient haircut for children under 12. Includes a lollipop reward.",
      durationMinutes: 30,
      price: "25.00",
      bufferBefore: 0,
      bufferAfter: 5,
      sortOrder: 7,
    },
    {
      id: "svc_008",
      businessId: bizId,
      categoryId: catWellness,
      name: "Hair & Beard Combo",
      slug: "hair-beard-combo",
      description:
        "The full experience. Classic cut paired with a beard sculpt. Our best value package.",
      durationMinutes: 75,
      price: "85.00",
      bufferBefore: 5,
      bufferAfter: 10,
      sortOrder: 8,
    },
  ];

  await db.insert(service).values(services).onConflictDoNothing();

  // ── Staff ─────────────────────────────────────────────────
  const staffMembers = [
    {
      id: "staff_001",
      businessId: bizId,
      name: "Marcus Rivera",
      slug: "marcus-rivera",
      bio: "Master barber with 12 years of experience. Specializes in precision fades and textured styles. Known for his attention to detail and warm personality.",
      specialties: "Fades, Textured Cuts, Beard Design",
      sortOrder: 1,
    },
    {
      id: "staff_002",
      businessId: bizId,
      name: "Elena Vasquez",
      slug: "elena-vasquez",
      bio: "Licensed barber-stylist trained in Milan. Brings a European approach to classic barbering with an emphasis on clean lines and scalp health.",
      specialties: "Classic Cuts, Scalp Treatments, Shaves",
      sortOrder: 2,
    },
    {
      id: "staff_003",
      businessId: bizId,
      name: "James Chen",
      slug: "james-chen",
      bio: "Former competition barber turned studio artist. Excels in creative fades, designs, and transformations.",
      specialties: "Creative Fades, Hair Design, Buzz Cuts",
      sortOrder: 3,
    },
    {
      id: "staff_004",
      businessId: bizId,
      name: "Amara Johnson",
      slug: "amara-johnson",
      bio: "Wellness specialist with a background in trichology. Passionate about scalp health and holistic grooming.",
      specialties: "Scalp Health, Wellness, Kids Cuts",
      sortOrder: 4,
    },
  ];

  await db.insert(staffProfile).values(staffMembers).onConflictDoNothing();

  // ── Staff ↔ Service assignments ───────────────────────────
  const assignments = [
    // Marcus: Classic Cut, Signature Fade, Beard Sculpt, Royal Shave, Hair & Beard Combo
    { id: nanoid(), staffId: "staff_001", serviceId: "svc_001" },
    { id: nanoid(), staffId: "staff_001", serviceId: "svc_002" },
    { id: nanoid(), staffId: "staff_001", serviceId: "svc_004" },
    { id: nanoid(), staffId: "staff_001", serviceId: "svc_005" },
    { id: nanoid(), staffId: "staff_001", serviceId: "svc_008" },
    // Elena: Classic Cut, Royal Shave, Scalp Treatment, Hair & Beard Combo
    { id: nanoid(), staffId: "staff_002", serviceId: "svc_001" },
    { id: nanoid(), staffId: "staff_002", serviceId: "svc_005" },
    { id: nanoid(), staffId: "staff_002", serviceId: "svc_006" },
    { id: nanoid(), staffId: "staff_002", serviceId: "svc_008" },
    // James: Signature Fade, Buzz Cut, Beard Sculpt, Kids Cut
    { id: nanoid(), staffId: "staff_003", serviceId: "svc_002" },
    { id: nanoid(), staffId: "staff_003", serviceId: "svc_003" },
    { id: nanoid(), staffId: "staff_003", serviceId: "svc_004" },
    { id: nanoid(), staffId: "staff_003", serviceId: "svc_007" },
    // Amara: Scalp Treatment, Kids Cut, Buzz Cut
    { id: nanoid(), staffId: "staff_004", serviceId: "svc_003" },
    { id: nanoid(), staffId: "staff_004", serviceId: "svc_006" },
    { id: nanoid(), staffId: "staff_004", serviceId: "svc_007" },
  ];

  await db.insert(staffService).values(assignments).onConflictDoNothing();

  // ── Weekly Availability ───────────────────────────────────
  type Day =
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";
  const weekdays: Day[] = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
  ];
  const weekend: Day[] = ["SATURDAY", "SUNDAY"];

  const availabilityEntries: {
    id: string;
    staffId: string;
    dayOfWeek: Day;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[] = [];

  // Marcus: Mon–Fri 9–18, Sat 10–16
  weekdays.forEach((d) =>
    availabilityEntries.push({
      id: nanoid(),
      staffId: "staff_001",
      dayOfWeek: d,
      startTime: "09:00",
      endTime: "18:00",
      isAvailable: true,
    }),
  );
  availabilityEntries.push({
    id: nanoid(),
    staffId: "staff_001",
    dayOfWeek: "SATURDAY",
    startTime: "10:00",
    endTime: "16:00",
    isAvailable: true,
  });
  availabilityEntries.push({
    id: nanoid(),
    staffId: "staff_001",
    dayOfWeek: "SUNDAY",
    startTime: "00:00",
    endTime: "00:00",
    isAvailable: false,
  });

  // Elena: Tue–Sat 10–19
  (["TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as Day[]).forEach(
    (d) =>
      availabilityEntries.push({
        id: nanoid(),
        staffId: "staff_002",
        dayOfWeek: d,
        startTime: "10:00",
        endTime: "19:00",
        isAvailable: true,
      }),
  );
  availabilityEntries.push({
    id: nanoid(),
    staffId: "staff_002",
    dayOfWeek: "MONDAY",
    startTime: "00:00",
    endTime: "00:00",
    isAvailable: false,
  });
  availabilityEntries.push({
    id: nanoid(),
    staffId: "staff_002",
    dayOfWeek: "SUNDAY",
    startTime: "00:00",
    endTime: "00:00",
    isAvailable: false,
  });

  // James: Mon–Fri 8–17
  weekdays.forEach((d) =>
    availabilityEntries.push({
      id: nanoid(),
      staffId: "staff_003",
      dayOfWeek: d,
      startTime: "08:00",
      endTime: "17:00",
      isAvailable: true,
    }),
  );
  weekend.forEach((d) =>
    availabilityEntries.push({
      id: nanoid(),
      staffId: "staff_003",
      dayOfWeek: d,
      startTime: "00:00",
      endTime: "00:00",
      isAvailable: false,
    }),
  );

  // Amara: Mon, Wed, Fri 9–17, Sat 9–14
  (["MONDAY", "WEDNESDAY", "FRIDAY"] as Day[]).forEach((d) =>
    availabilityEntries.push({
      id: nanoid(),
      staffId: "staff_004",
      dayOfWeek: d,
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true,
    }),
  );
  (["TUESDAY", "THURSDAY"] as Day[]).forEach((d) =>
    availabilityEntries.push({
      id: nanoid(),
      staffId: "staff_004",
      dayOfWeek: d,
      startTime: "00:00",
      endTime: "00:00",
      isAvailable: false,
    }),
  );
  availabilityEntries.push({
    id: nanoid(),
    staffId: "staff_004",
    dayOfWeek: "SATURDAY",
    startTime: "09:00",
    endTime: "14:00",
    isAvailable: true,
  });
  availabilityEntries.push({
    id: nanoid(),
    staffId: "staff_004",
    dayOfWeek: "SUNDAY",
    startTime: "00:00",
    endTime: "00:00",
    isAvailable: false,
  });

  await db
    .insert(weeklyAvailability)
    .values(availabilityEntries)
    .onConflictDoNothing();

  // ── Breaks ────────────────────────────────────────────────
  const breakEntries = [
    // Marcus: lunch break 12:30–13:15 weekdays
    ...weekdays.map((d) => ({
      id: nanoid(),
      staffId: "staff_001",
      dayOfWeek: d as Day,
      startTime: "12:30",
      endTime: "13:15",
    })),
    // Elena: lunch 13:00–14:00
    ...(
      ["TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as Day[]
    ).map((d) => ({
      id: nanoid(),
      staffId: "staff_002",
      dayOfWeek: d,
      startTime: "13:00",
      endTime: "14:00",
    })),
    // James: lunch 12:00–12:45
    ...weekdays.map((d) => ({
      id: nanoid(),
      staffId: "staff_003",
      dayOfWeek: d as Day,
      startTime: "12:00",
      endTime: "12:45",
    })),
  ];

  await db.insert(breakPeriod).values(breakEntries).onConflictDoNothing();

  // ── Time Off ──────────────────────────────────────────────
  const now = new Date();
  await db
    .insert(timeOff)
    .values([
      {
        id: nanoid(),
        staffId: "staff_002",
        startDate: addDays(now, 10),
        endDate: addDays(now, 12),
        reason: "Family vacation",
      },
      {
        id: nanoid(),
        staffId: "staff_003",
        startDate: addDays(now, 20),
        endDate: addDays(now, 20),
        reason: "Dental appointment",
      },
    ])
    .onConflictDoNothing();

  // ── Sample Customers ──────────────────────────────────────
  const customers = [
    {
      id: "cust_001",
      name: "Alex Thompson",
      email: "alex@example.com",
      role: "CUSTOMER",
    },
    {
      id: "cust_002",
      name: "Sarah Mitchell",
      email: "sarah@example.com",
      role: "CUSTOMER",
    },
    {
      id: "cust_003",
      name: "David Park",
      email: "david@example.com",
      role: "CUSTOMER",
    },
    {
      id: "cust_004",
      name: "Jordan Williams",
      email: "jordan@example.com",
      role: "CUSTOMER",
    },
  ];

  await db
    .insert(user)
    .values(
      customers.map((c) => ({
        ...c,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    )
    .onConflictDoNothing();

  // ── Admin user ────────────────────────────────────────────
  await db
    .insert(user)
    .values({
      id: "admin_001",
      name: "Studio Admin",
      email: "admin@artisanstudio.com",
      emailVerified: true,
      role: "ADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  // ── Sample Appointments ───────────────────────────────────
  const tomorrow = addDays(now, 1);
  const dayAfter = addDays(now, 2);

  const sampleAppointments = [
    // Upcoming confirmed
    {
      id: "apt_001",
      bookingRef: "SL-DEMO0001",
      businessId: bizId,
      serviceId: "svc_002",
      staffId: "staff_001",
      customerId: "cust_001",
      startAt: setMinutes(setHours(tomorrow, 10), 0),
      endAt: setMinutes(setHours(tomorrow, 11), 0),
      status: "CONFIRMED" as const,
      serviceName: "Signature Fade",
      serviceDuration: 60,
      servicePrice: "65.00",
      staffName: "Marcus Rivera",
      customerName: "Alex Thompson",
      customerEmail: "alex@example.com",
    },
    {
      id: "apt_002",
      bookingRef: "SL-DEMO0002",
      businessId: bizId,
      serviceId: "svc_001",
      staffId: "staff_002",
      customerId: "cust_002",
      startAt: setMinutes(setHours(tomorrow, 14), 0),
      endAt: setMinutes(setHours(tomorrow, 14), 45),
      status: "CONFIRMED" as const,
      serviceName: "Classic Cut",
      serviceDuration: 45,
      servicePrice: "55.00",
      staffName: "Elena Vasquez",
      customerName: "Sarah Mitchell",
      customerEmail: "sarah@example.com",
    },
    // Past completed
    {
      id: "apt_003",
      bookingRef: "SL-DEMO0003",
      businessId: bizId,
      serviceId: "svc_004",
      staffId: "staff_001",
      customerId: "cust_003",
      startAt: setMinutes(setHours(subDays(now, 3), 11), 0),
      endAt: setMinutes(setHours(subDays(now, 3), 11), 30),
      status: "COMPLETED" as const,
      serviceName: "Beard Sculpt",
      serviceDuration: 30,
      servicePrice: "35.00",
      staffName: "Marcus Rivera",
      customerName: "David Park",
      customerEmail: "david@example.com",
    },
    // Cancelled
    {
      id: "apt_004",
      bookingRef: "SL-DEMO0004",
      businessId: bizId,
      serviceId: "svc_006",
      staffId: "staff_004",
      customerId: "cust_004",
      startAt: setMinutes(setHours(subDays(now, 1), 9), 0),
      endAt: setMinutes(setHours(subDays(now, 1), 9), 45),
      status: "CANCELLED" as const,
      serviceName: "Scalp Treatment",
      serviceDuration: 45,
      servicePrice: "60.00",
      staffName: "Amara Johnson",
      customerName: "Jordan Williams",
      customerEmail: "jordan@example.com",
    },
    // Day after tomorrow
    {
      id: "apt_005",
      bookingRef: "SL-DEMO0005",
      businessId: bizId,
      serviceId: "svc_008",
      staffId: "staff_002",
      customerId: "cust_001",
      startAt: setMinutes(setHours(dayAfter, 10), 0),
      endAt: setMinutes(setHours(dayAfter, 11), 15),
      status: "PENDING" as const,
      serviceName: "Hair & Beard Combo",
      serviceDuration: 75,
      servicePrice: "85.00",
      staffName: "Elena Vasquez",
      customerName: "Alex Thompson",
      customerEmail: "alex@example.com",
    },
  ];

  await db.insert(appointment).values(sampleAppointments).onConflictDoNothing();

  // Status history
  const historyEntries = sampleAppointments.map((apt) => ({
    id: nanoid(),
    appointmentId: apt.id,
    previousStatus: null,
    newStatus: apt.status,
    reason:
      apt.status === "CANCELLED"
        ? "Customer requested cancellation"
        : "Booked by customer",
    createdAt: new Date(),
  }));

  await db
    .insert(appointmentStatusHistory)
    .values(historyEntries)
    .onConflictDoNothing();

  console.log("✅ Seed complete!");
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
