import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasAdminAccess, getOrCreateUser } from "@/lib/auth";
import { DEFAULT_RETURN_PATH, sanitizeReturnTo } from "@/lib/auth/redirect";

export default async function AuthRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const [{ returnTo }, { userId }] = await Promise.all([searchParams, auth()]);

  if (userId) {
    // Sync name/email from Clerk so we don't depend on the webhook
    await getOrCreateUser(userId);
  }

  if (await hasAdminAccess(userId)) {
    redirect("/admin");
  }

  redirect(sanitizeReturnTo(returnTo) ?? DEFAULT_RETURN_PATH);
}
