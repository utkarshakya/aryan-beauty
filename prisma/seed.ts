import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL_SUFFIX = "@example.com";
const GAP_MIN = 15;
const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
const NOTES = [
  "",
  "Prefers morning slots",
  "Allergic to bleach",
  "Referred by a friend",
  "Asked for the same stylist",
];

type SeedStatus = "pending" | "confirmed" | "cancelled";
type PlanItem = {
  offset: number;
  service: number;
  customer: number;
  status: SeedStatus;
  slot: number;
};

const SERVICES = [
  {
    name: "Haircut",
    description: "Professional haircut and styling",
    price: 300,
    durationMin: 30,
    category: "Hair",
    active: true,
  },
  {
    name: "Hair Color",
    description: "Professional hair coloring service",
    price: 1200,
    durationMin: 120,
    category: "Hair",
    active: true,
  },
  {
    name: "Facial",
    description: "Relaxing facial treatment",
    price: 500,
    durationMin: 60,
    category: "Skin",
    active: true,
  },
  {
    name: "Manicure",
    description: "Nail care and manicure",
    price: 300,
    durationMin: 45,
    category: "Nails",
    active: true,
  },
  {
    name: "Pedicure",
    description: "Foot care and pedicure",
    price: 400,
    durationMin: 45,
    category: "Nails",
    active: true,
  },
  {
    name: "Bridal Makeup",
    description: "Complete bridal makeup service",
    price: 5000,
    durationMin: 180,
    category: "Makeup",
    active: true,
  },
  {
    name: "Threading",
    description: "Eyebrow threading and shaping",
    price: 100,
    durationMin: 15,
    category: "Skin",
    active: true,
  },
  {
    name: "Hair Spa",
    description: "Deep conditioning hair spa treatment",
    price: 900,
    durationMin: 60,
    category: "Hair",
    active: true,
  },
  {
    name: "Keratin Treatment",
    description: "Smoothening and keratin care (currently paused)",
    price: 3500,
    durationMin: 150,
    category: "Hair",
    active: false,
  },
];

const CUSTOMERS = [
  { name: "Priya Sharma", phone: "9820011223", email: "priya.sharma@example.com" },
  { name: "Ananya Iyer", phone: "9945566778", email: "ananya.iyer@example.com" },
  { name: "Meera Nair", phone: "9791122334", email: "meera.nair@example.com" },
  { name: "Ritika Verma", phone: "9811223344", email: "ritika.verma@example.com" },
  { name: "Sneha Patel", phone: "9657788990", email: "sneha.patel@example.com" },
  { name: "Kavya Reddy", phone: "9704455661", email: "kavya.reddy@example.com" },
];

const OWNER = -1;

const PLAN: PlanItem[] = [
  { offset: -21, service: 0, customer: 0, status: "confirmed", slot: 0 },
  { offset: -21, service: 6, customer: 2, status: "confirmed", slot: 1 },
  { offset: -18, service: 1, customer: 1, status: "confirmed", slot: 0 },
  { offset: -18, service: 3, customer: 5, status: "confirmed", slot: 1 },
  { offset: -14, service: 2, customer: 3, status: "confirmed", slot: 0 },
  { offset: -14, service: 0, customer: 4, status: "confirmed", slot: 1 },
  { offset: -11, service: 5, customer: 0, status: "confirmed", slot: 0 },
  { offset: -7, service: 7, customer: 2, status: "confirmed", slot: 0 },
  { offset: -7, service: 4, customer: 1, status: "confirmed", slot: 1 },
  { offset: -5, service: 0, customer: 5, status: "cancelled", slot: 0 },
  { offset: -5, service: 2, customer: 3, status: "confirmed", slot: 1 },
  { offset: -3, service: 3, customer: 4, status: "confirmed", slot: 0 },
  { offset: -3, service: 6, customer: 0, status: "confirmed", slot: 1 },
  { offset: -2, service: 1, customer: 1, status: "confirmed", slot: 0 },
  { offset: -2, service: 4, customer: 2, status: "confirmed", slot: 1 },

  { offset: 0, service: 2, customer: 3, status: "confirmed", slot: 0 },
  { offset: 0, service: 0, customer: 0, status: "pending", slot: 1 },

  { offset: 1, service: 0, customer: 4, status: "confirmed", slot: 0 },
  { offset: 1, service: 2, customer: 0, status: "pending", slot: 1 },
  { offset: 2, service: 1, customer: 5, status: "cancelled", slot: 0 },
  { offset: 2, service: 3, customer: 1, status: "pending", slot: 1 },
  { offset: 2, service: 6, customer: 2, status: "pending", slot: 2 },
  { offset: 3, service: 5, customer: 3, status: "confirmed", slot: 0 },
  { offset: 3, service: 0, customer: 2, status: "pending", slot: 1 },
  { offset: 5, service: 7, customer: 0, status: "pending", slot: 0 },
  { offset: 5, service: 4, customer: 4, status: "confirmed", slot: 1 },
  { offset: 7, service: 2, customer: 5, status: "pending", slot: 0 },
  { offset: 7, service: 0, customer: 1, status: "pending", slot: 1 },
  { offset: 9, service: 1, customer: 2, status: "confirmed", slot: 0 },
  { offset: 9, service: 3, customer: 3, status: "pending", slot: 1 },
  { offset: 12, service: 4, customer: 0, status: "pending", slot: 0 },
  { offset: 12, service: 7, customer: 5, status: "confirmed", slot: 1 },
];

const OWNER_PLAN: PlanItem[] = [
  { offset: -10, service: 2, customer: OWNER, status: "confirmed", slot: 0 },
  { offset: 4, service: 0, customer: OWNER, status: "confirmed", slot: 0 },
  { offset: 6, service: 7, customer: OWNER, status: "pending", slot: 0 },
];

async function upsertServices() {
  let created = 0;
  let updated = 0;
  for (const data of SERVICES) {
    const existing = await prisma.service.findFirst({
      where: { name: data.name },
    });
    if (existing) {
      await prisma.service.update({ where: { id: existing.id }, data });
      updated += 1;
    } else {
      await prisma.service.create({ data });
      created += 1;
    }
  }
  return { created, updated };
}

async function clearDemoData() {
  const demoCustomers = await prisma.customer.findMany({
    where: { email: { endsWith: DEMO_EMAIL_SUFFIX } },
    select: { id: true },
  });
  const ids = demoCustomers.map((c) => c.id);
  if (ids.length > 0) {
    await prisma.appointment.deleteMany({
      where: { customerId: { in: ids } },
    });
    await prisma.customer.deleteMany({ where: { id: { in: ids } } });
  }
  return ids.length;
}

async function findOwner() {
  const owner = await prisma.user.findFirst({
    where: { email: { not: null } },
    orderBy: { id: "asc" },
  });
  if (!owner || !owner.email) return null;

  const existing = await prisma.customer.findFirst({
    where: { email: owner.email },
  });
  const customer =
    existing ??
    (await prisma.customer.create({
      data: {
        email: owner.email,
        name: owner.name || "You",
        userId: null,
      },
    }));

  const appointmentCount = await prisma.appointment.count({
    where: { customerId: customer.id },
  });
  return { customer, hasAppointments: appointmentCount > 0 };
}

function planByDay(plan: PlanItem[]) {
  const days = new Map<number, PlanItem[]>();
  for (const item of plan) {
    const list = days.get(item.offset) ?? [];
    list.push(item);
    days.set(item.offset, list);
  }
  for (const list of days.values()) {
    list.sort((a, b) => a.slot - b.slot);
  }
  return [...days.entries()].sort((a, b) => a[0] - b[0]);
}

async function main() {
  const servicesResult = await upsertServices();
  const removedDemoCustomers = await clearDemoData();
  const owner = await findOwner();

  const serviceRows = await prisma.service.findMany({
    where: { name: { in: SERVICES.map((s) => s.name) } },
  });
  const serviceByName = new Map(serviceRows.map((r) => [r.name, r]));

  const demoCustomers = await prisma.customer.createManyAndReturn({
    data: CUSTOMERS,
  });
  const demoIds = demoCustomers.map((c) => c.id);

  const settings = await prisma.businessSettings.findFirst({
    orderBy: { id: "asc" },
  });
  const openingHours = (settings?.openingHours ?? {
    monday: { open: "09:00", close: "18:00" },
    tuesday: { open: "09:00", close: "18:00" },
    wednesday: { open: "09:00", close: "18:00" },
    thursday: { open: "09:00", close: "18:00" },
    friday: { open: "09:00", close: "18:00" },
    saturday: { open: "09:00", close: "18:00" },
    sunday: { open: "09:00", close: "18:00" },
  }) as Record<string, { open: string; close: string }>;
  const closedWeekdays = settings?.closedWeekdays ?? [];
  const closures = (settings?.closures ?? []) as Array<{
    date: string;
    reason: string;
  }>;

  const plan: PlanItem[] =
    owner && !owner.hasAppointments ? [...PLAN, ...OWNER_PLAN] : [...PLAN];

  const ownerCustomerId = owner ? owner.customer.id : null;
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  let appointmentsCreated = 0;
  let daysSkipped = 0;
  let slotsSkipped = 0;
  let noteIndex = 0;

  for (const [offset, items] of planByDay(plan)) {
    const day = new Date(baseDate);
    day.setDate(day.getDate() + offset);
    const dateKey = [
      day.getFullYear(),
      String(day.getMonth() + 1).padStart(2, "0"),
      String(day.getDate()).padStart(2, "0"),
    ].join("-");

    const hours = openingHours[DAY_NAMES[day.getDay()]];
    if (closedWeekdays.includes(day.getDay()) || !hours || closures.some((c) => c.date === dateKey)) {
      daysSkipped += 1;
      continue;
    }

    const [openH, openM] = hours.open.split(":").map(Number);
    const [closeH, closeM] = hours.close.split(":").map(Number);
    const openMs = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      openH,
      openM,
    ).getTime();
    const closeMs = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      closeH,
      closeM,
    ).getTime();

    const totalDurationMs = items.reduce((sum, item) => {
      const service = serviceByName.get(SERVICES[item.service].name);
      return sum + (service?.durationMin ?? 0) * 60_000;
    }, 0);

    let cursor: number;
    if (offset === 0) {
      const soonest = Math.ceil((Date.now() + 90 * 60_000) / (15 * 60_000)) * (15 * 60_000);
      cursor = Math.max(soonest, openMs);
      if (cursor + totalDurationMs > closeMs) cursor = openMs;
    } else {
      cursor = openMs + (Math.abs(offset) % 3) * 45 * 60_000;
    }

    for (const item of items) {
      const service = serviceByName.get(SERVICES[item.service].name);
      if (!service) {
        slotsSkipped += 1;
        continue;
      }
      const durationMs = service.durationMin * 60_000;
      if (cursor + durationMs > closeMs) {
        slotsSkipped += 1;
        continue;
      }

      const customerId =
        item.customer === OWNER ? ownerCustomerId : demoIds[item.customer];
      if (customerId == null) {
        slotsSkipped += 1;
        continue;
      }

      await prisma.appointment.create({
        data: {
          customerId,
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: service.price,
          serviceDurationMin: service.durationMin,
          startTime: new Date(cursor),
          endTime: new Date(cursor + durationMs),
          status: item.status,
          notes: NOTES[noteIndex % NOTES.length],
        },
      });
      noteIndex += 1;
      appointmentsCreated += 1;
      cursor += durationMs + GAP_MIN * 60_000;
    }
  }

  console.log(
    `Services: ${servicesResult.created} created, ${servicesResult.updated} updated`,
  );
  console.log(`Demo customers: ${demoCustomers.length} (${removedDemoCustomers} old rows replaced)`);
  console.log(`Appointments: ${appointmentsCreated} created`);
  if (daysSkipped > 0 || slotsSkipped > 0) {
    console.log(`Skipped: ${daysSkipped} closed day(s), ${slotsSkipped} slot(s) outside opening hours`);
  }
  if (!owner) {
    console.log(
      "Owner history: skipped (no user with an email yet) — sign in, then run db:seed again.",
    );
  } else if (owner.hasAppointments) {
    console.log("Owner history: kept existing appointments (seed does not touch them).");
  } else {
    console.log("Owner history: 3 appointments linked to your account.");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
