import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const getAdminUserIds = () =>
  (process.env.ADMIN_CLERK_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    await auth.protect();
  }

  if (!getAdminUserIds().includes(userId!)) {
    redirect("/");
  }

  return userId!;
}
