import { prisma } from "@/lib/prisma";
import { Service } from "@prisma/client";
import { cache } from "react";

export type ServiceWithAppointments = Service & {
  _count: {
    appointments: number;
  };
};

export type ServiceFormData = {
  name: string;
  description: string;
  category: string;
  price: number;
  durationMin: number;
  active: boolean;
};

export async function getAllServices(): Promise<ServiceWithAppointments[]> {
  return prisma.service.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: { _count: { select: { appointments: true } } },
  });
}

async function fetchActiveServices() {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

/**
 * Request-scoped dedup — several components on the same render ask for the
 * active catalogue. React's `cache()` (not the `next/cache` directive): the
 * result is per-request only and is never shared across requests.
 */
export const getActiveServices = cache(fetchActiveServices);

export async function getServiceById(id: number) {
  return prisma.service.findUnique({ where: { id } });
}

export async function createService(data: ServiceFormData) {
  return prisma.service.create({ data });
}

export async function updateService(id: number, data: ServiceFormData) {
  return prisma.service.update({ where: { id }, data });
}

export async function toggleService(id: number, active: boolean) {
  return prisma.service.update({ where: { id }, data: { active } });
}