import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const SERVICES = [
  // Hair
  {
    name: "Haircut",
    description: "Professional haircut and styling",
    price: 300,
    durationMin: 30,
    category: "Hair",
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
  // Skin
  {
    name: "Facial",
    description: "Relaxing facial treatment",
    price: 500,
    durationMin: 60,
    category: "Skin",
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
  // Nails
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
];

async function main() {
  // Optional cleanup: remove old demo customers and their appointments from prior seeds
  const demoCustomers = await prisma.customer.findMany({
    where: { email: { endsWith: "@example.com" } },
    select: { id: true },
  });

  if (demoCustomers.length > 0) {
    const ids = demoCustomers.map((c) => c.id);
    await prisma.appointment.deleteMany({
      where: { customerId: { in: ids } },
    });
    await prisma.customer.deleteMany({
      where: { id: { in: ids } },
    });
    console.log(`Cleaned up ${ids.length} demo customer(s) and their appointments.`);
  }

  // Upsert the 6 core services across 3 categories
  let created = 0;
  let updated = 0;

  for (const data of SERVICES) {
    const existing = await prisma.service.findFirst({
      where: { name: data.name },
    });

    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data,
      });
      updated++;
    } else {
      await prisma.service.create({
        data,
      });
      created++;
    }
  }

  console.log(`Services seeded: ${created} created, ${updated} updated.`);
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
