import { prisma } from "@/lib/prisma";
import { CustomerProfile, WalkInCustomer } from "../types";

export async function getCustomerByUserId(userId: number): Promise<CustomerProfile | null> {
  return prisma.customer.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          clerkUserId: true,
          email: true,
          name: true,
          role: true,
          status: true,
        },
      },
    },
  });
}

export async function getCustomerById(id: number): Promise<CustomerProfile | null> {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          clerkUserId: true,
          email: true,
          name: true,
          role: true,
          status: true,
        },
      },
    },
  });
}

export async function getWalkInCustomers(): Promise<WalkInCustomer[]> {
  return prisma.customer.findMany({
    where: { userId: null },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function linkWalkInCustomer(customerId: number, userId: number) {
  return prisma.customer.update({
    where: { id: customerId },
    data: { userId },
  });
}

export async function updateCustomerProfile(
  customerId: number,
  data: { name?: string; phone?: string | null; email?: string | null }
) {
  return prisma.customer.update({
    where: { id: customerId },
    data,
  });
}

export async function getCustomerWithAppointments(customerId: number) {
  return prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      appointments: {
        include: { service: true },
        orderBy: { startTime: "desc" },
      },
      user: {
        select: {
          clerkUserId: true,
          email: true,
          name: true,
          role: true,
          status: true,
        },
      },
    },
  });
}