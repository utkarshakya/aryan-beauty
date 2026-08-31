"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwnerAdmin } from "@/lib/auth";

const readService = (formData: FormData) => {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "Other").trim() || "Other";
  const price = Number(formData.get("price"));
  const durationMin = Number(formData.get("durationMin"));

  if (!name || name.length > 100) throw new Error("Enter a service name.");
  if (!Number.isFinite(price) || price < 0) throw new Error("Enter a valid price.");
  if (!Number.isInteger(durationMin) || durationMin <= 0) {
    throw new Error("Enter a valid duration.");
  }

  return { name, description, category, price, durationMin };
};

export async function createService(formData: FormData) {
  await requireOwnerAdmin();
  await prisma.service.create({ data: readService(formData) });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/book");
  revalidatePath("/");
}

export async function updateService(id: number, formData: FormData) {
  await requireOwnerAdmin();
  if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid service.");
  await prisma.service.update({ where: { id }, data: readService(formData) });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/book");
  revalidatePath("/");
}

export async function toggleService(id: number, active: boolean) {
  await requireOwnerAdmin();
  if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid service.");
  await prisma.service.update({ where: { id }, data: { active } });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/book");
  revalidatePath("/");
}
