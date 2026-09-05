"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerAdmin } from "@/lib/auth";
import {
  getAllServices,
  getActiveServices,
  createService,
  updateService,
  toggleService,
} from "../db/queries";

export async function getServicesAction() {
  await requireOwnerAdmin();
  return getAllServices();
}

export async function getActiveServicesAction() {
  return getActiveServices();
}

export async function createServiceAction(
  _prevState: { errors?: Record<string, string>; success?: string },
  formData: FormData
): Promise<{ errors?: Record<string, string>; success?: string }> {
  await requireOwnerAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "Other").trim() || "Other";
  const price = Number(formData.get("price"));
  const durationMin = Number(formData.get("durationMin"));
  const active = formData.get("active") === "on";

  const errors: Record<string, string> = {};

  if (!name || name.length > 100) errors.name = "Enter a service name (max 100 chars)";
  if (!Number.isFinite(price) || price < 0) errors.price = "Enter a valid price";
  if (!Number.isInteger(durationMin) || durationMin <= 0) errors.durationMin = "Enter a valid duration in minutes";

  if (Object.keys(errors).length > 0) return { errors };

  await createService({ name, description, category, price, durationMin, active });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/appointments");
  revalidatePath("/");

  return { success: "Service created successfully" };
}

export async function updateServiceAction(
  id: number,
  _prevState: { errors?: Record<string, string>; success?: string },
  formData: FormData
): Promise<{ errors?: Record<string, string>; success?: string }> {
  await requireOwnerAdmin();

  if (!Number.isInteger(id) || id <= 0) return { errors: { form: "Invalid service" } };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "Other").trim() || "Other";
  const price = Number(formData.get("price"));
  const durationMin = Number(formData.get("durationMin"));
  const active = formData.get("active") === "on";

  const errors: Record<string, string> = {};

  if (!name || name.length > 100) errors.name = "Enter a service name (max 100 chars)";
  if (!Number.isFinite(price) || price < 0) errors.price = "Enter a valid price";
  if (!Number.isInteger(durationMin) || durationMin <= 0) errors.durationMin = "Enter a valid duration in minutes";

  if (Object.keys(errors).length > 0) return { errors };

  await updateService(id, { name, description, category, price, durationMin, active });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/appointments");
  revalidatePath("/");

  return { success: "Service updated successfully" };
}

export async function toggleServiceAction(
  id: number,
  active: boolean
): Promise<{ errors?: Record<string, string>; success?: string }> {
  await requireOwnerAdmin();

  if (!Number.isInteger(id) || id <= 0) return { errors: { form: "Invalid service" } };

  await toggleService(id, active);
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/appointments");
  revalidatePath("/");

  return { success: `Service ${active ? "activated" : "deactivated"}` };
}