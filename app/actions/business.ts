"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerAdmin } from "@/lib/auth";
import {
  getBusinessSettingsOrCreate,
  updateBusinessSettings,
} from "@/lib/db/business";

export async function getBusinessSettingsAction() {
  await requireOwnerAdmin();
  return getBusinessSettingsOrCreate();
}

export async function updateBusinessSettingsAction(
  _prevState: { errors?: Record<string, string>; success?: string },
  formData: FormData
): Promise<{ errors?: Record<string, string>; success?: string }> {
  await requireOwnerAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const timeZone = String(formData.get("timeZone") ?? "Asia/Kolkata").trim();

  const openingHoursRaw = String(formData.get("openingHours") ?? "{}");
  let openingHours: Record<string, { open: string; close: string }> = {};
  try {
    openingHours = JSON.parse(openingHoursRaw);
  } catch {
    openingHours = {};
  }

  const closedWeekdaysRaw = String(formData.get("closedWeekdays") ?? "[]");
  let closedWeekdays: number[] = [];
  try {
    closedWeekdays = JSON.parse(closedWeekdaysRaw);
  } catch {
    closedWeekdays = [];
  }

  const closuresRaw = String(formData.get("closures") ?? "[]");
  let closures: Array<{ date: string; reason: string }> = [];
  try {
    closures = JSON.parse(closuresRaw);
  } catch {
    closures = [];
  }

  const slotIntervalMin = Number(formData.get("slotIntervalMin"));
  const minBookingNoticeMin = Number(formData.get("minBookingNoticeMin"));
  const cancellationCutoffMin = Number(formData.get("cancellationCutoffMin"));

  const errors: Record<string, string> = {};

  if (!name || name.length > 100) {
    errors.name = "Enter a business name (max 100 chars)";
  }
  if (!Number.isInteger(slotIntervalMin) || slotIntervalMin < 5 || slotIntervalMin > 120) {
    errors.slotIntervalMin = "Enter a valid slot interval (5-120 minutes)";
  }
  if (!Number.isInteger(minBookingNoticeMin) || minBookingNoticeMin < 0) {
    errors.minBookingNoticeMin = "Enter a valid minimum booking notice (minutes)";
  }
  if (!Number.isInteger(cancellationCutoffMin) || cancellationCutoffMin < 0) {
    errors.cancellationCutoffMin = "Enter a valid cancellation cutoff (minutes)";
  }

  if (Object.keys(errors).length > 0) return { errors };

  await updateBusinessSettings({
    name,
    phone,
    address,
    timeZone,
    openingHours,
    closedWeekdays,
    closures,
    slotIntervalMin,
    minBookingNoticeMin,
    cancellationCutoffMin,
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  revalidatePath("/appointments");
  revalidatePath("/");

  return { success: "Business settings saved successfully" };
}