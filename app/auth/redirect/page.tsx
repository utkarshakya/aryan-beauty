import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasAdminAccess } from "@/lib/auth";

export default async function AuthRedirectPage() {
  const { userId } = await auth();

  if (await hasAdminAccess(userId)) {
    redirect("/admin");
  }

  redirect("/appointments");
}
