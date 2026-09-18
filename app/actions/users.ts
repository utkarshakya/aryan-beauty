"use server";

import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { requireOwnerAdmin } from "@/lib/auth";
import { setUserRole, disableUser, restoreUser } from "@/lib/auth";
import { getAppUsers } from "@/lib/db/users";
import type { UserRole } from "@/lib/auth";

export async function getStaffUsersAction() {
  await requireOwnerAdmin();
  return getAppUsers();
}

export async function inviteStaffAction(
  _prevState: { errors?: Record<string, string>; success?: string },
  formData: FormData
): Promise<{ errors?: Record<string, string>; success?: string }> {
  await requireOwnerAdmin();

  const email = String(formData.get("email") ?? "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { errors: { email: "Enter a valid email address" } };
  }

  const client = await clerkClient();

  try {
    await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { role: "staff", status: "active" },
      redirectUrl: "/auth/redirect",
      notify: true,
    });
  } catch {
    return {
      errors: {
        email:
          "This email is already invited or already has an account.",
      },
    };
  }

  revalidatePath("/admin/staff");
  return { success: `Invitation sent to ${email}` };
}

export async function updateRoleAction(
  clerkUserId: string,
  role: string
): Promise<{ ok: boolean; error?: string }> {
  const allowed = new Set<string>(["staff", "customer", "admin"]);

  if (!allowed.has(role)) {
    return { ok: false, error: "Invalid role." };
  }

  try {
    await setUserRole(clerkUserId, role as UserRole);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed." };
  }

  revalidatePath("/admin/staff");
  return { ok: true };
}

export async function disableUserAction(
  clerkUserId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await disableUser(clerkUserId);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed." };
  }

  revalidatePath("/admin/staff");
  return { ok: true };
}

export async function restoreUserAction(
  clerkUserId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await restoreUser(clerkUserId);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed." };
  }

  revalidatePath("/admin/staff");
  return { ok: true };
}