"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireActiveUser, requireAdmin } from "@/lib/auth";
import {
  getCustomerByUserId,
  getWalkInCustomers,
  linkWalkInCustomer,
  updateCustomerProfile,
  getCustomerWithAppointments,
  type CustomerProfile,
  type WalkInCustomer,
} from "@/lib/db/customers";

// ─── Customer Profile ───────────────────────────────────────────────────────

export async function getMyProfile(): Promise<CustomerProfile | null> {
  const userId = await requireActiveUser();

  const appUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!appUser) return null;

  return getCustomerByUserId(appUser.id);
}

export async function updateMyProfile(
  _prevState: { errors?: Record<string, string>; success?: string },
  formData: FormData
): Promise<{ errors?: Record<string, string>; success?: string }> {
  const userId = await requireActiveUser();

  const appUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!appUser) return { errors: { form: "User not found" } };

  const customer = await prisma.customer.findUnique({
    where: { userId: appUser.id },
  });
  if (!customer)
    return { errors: { form: "Customer profile not found" } };

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;

  const errors: Record<string, string> = {};

  if (!name) errors.name = "Name is required";
  if (phone && !/^[6-9]\d{9}$/.test(phone))
    errors.phone = "Enter a valid 10-digit Indian mobile number";

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  await updateCustomerProfile(customer.id, { name, phone, email });
  revalidatePath("/appointments");
  revalidatePath("/admin");

  return { success: "Profile updated successfully" };
}

// ─── Admin Actions ──────────────────────────────────────────────────────────

export async function getWalkInCustomersAction(): Promise<WalkInCustomer[]> {
  await requireAdmin();
  return getWalkInCustomers();
}

export async function linkWalkInCustomerAction(
  _prevState: { errors?: Record<string, string>; success?: string },
  formData: FormData
): Promise<{ errors?: Record<string, string>; success?: string }> {
  await requireAdmin();

  const customerId = Number(formData.get("customerId"));
  const clerkUserId = String(formData.get("clerkUserId") ?? "").trim();

  if (!Number.isInteger(customerId) || customerId <= 0) {
    return { errors: { form: "Invalid customer" } };
  }

  if (!clerkUserId) {
    return { errors: { form: "Clerk user ID required" } };
  }

  const appUser = await prisma.user.findUnique({
    where: { clerkUserId },
  });
  if (!appUser) {
    return { errors: { form: "Clerk user not found in database" } };
  }

  await linkWalkInCustomer(customerId, appUser.id);
  revalidatePath("/admin");
  revalidatePath("/appointments");

  return { success: "Walk-in customer linked successfully" };
}

export async function getCustomerDetailAction(customerId: number) {
  await requireAdmin();
  return getCustomerWithAppointments(customerId);
}
