import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const services = [
    {
      name: "Haircut",
      description: "Professional haircut and styling",
      price: 300,
      durationMin: 30,
      category: "Hair",
    },
    {
      name: "Hair Color",
      description: "Professional hair coloring service",
      price: 1200,
      durationMin: 120,
      category: "Hair",
    },
    {
      name: "Facial",
      description: "Relaxing facial treatment",
      price: 500,
      durationMin: 60,
      category: "Skin",
    },
    {
      name: "Manicure",
      description: "Nail care and manicure",
      price: 300,
      durationMin: 45,
      category: "Nails",
    },
    {
      name: "Pedicure",
      description: "Foot care and pedicure",
      price: 400,
      durationMin: 45,
      category: "Nails",
    },
    {
      name: "Bridal Makeup",
      description: "Complete bridal makeup service",
      price: 5000,
      durationMin: 180,
      category: "Makeup",
    },
  ];

  for (const service of services) {
    await prisma.service.create({
      data: service,
    });
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
