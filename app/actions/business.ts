"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerAdmin } from "@/lib/auth";
import { GENERIC_FORM_ERROR, logServerError } from "@/lib/errors";
import {
  getBusinessSettingsOrCreate,
  updateBusinessSettings,
} from "@/lib/db/business";
import { parseBusinessSettingsForm } from "@/lib/validation/business";

export async function getBusinessSettingsAction() {
  await requireOwnerAdmin();
  return getBusinessSettingsOrCreate();
}

export async function updateBusinessSettingsAction(
  _prevState: { errors?: Record<string, string>; success?: string },
  formData: FormData
): Promise<{ errors?: Record<string, string>; success?: string }> {
  await requireOwnerAdmin();

  const parsed = parseBusinessSettingsForm(formData);
  if (!parsed.ok) {
    return { errors: parsed.errors };
  }

  try {
    await updateBusinessSettings(parsed.data);

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath("/appointments");
    revalidatePath("/");
  } catch (error) {
    logServerError("updateBusinessSettingsAction", error);
    return { errors: { form: GENERIC_FORM_ERROR } };
  }

  return { success: "Business settings saved successfully" };
}
