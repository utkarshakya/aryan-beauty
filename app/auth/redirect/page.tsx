import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasAdminAccess, getOrCreateUser } from "@/lib/auth";

export default async function AuthRedirectPage() {
  const { userId } = await auth();

  if (userId) {
    // Sync name/email from Clerk so we don't depend on the webhook
    await getOrCreateUser(userId);
  }

  if (await hasAdminAccess(userId)) {
    redirect("/admin");
  }

  redirect("/appointments");
}
