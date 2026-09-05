import { prisma } from "@/lib/prisma";
import { ServiceWithAppointments, ServiceFormData } from "../types";

export async function getAllServices(): Promise<ServiceWithAppointments[]> {
  return prisma.service.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: { _count: { select: { appointments: true } } },
  });
}

export async function getActiveServices() {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

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