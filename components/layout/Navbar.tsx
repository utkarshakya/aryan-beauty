import { auth } from "@clerk/nextjs/server";
import { hasAdminAccess } from "@/lib/auth";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const { userId } = await auth();
  const canAccessAdmin = await hasAdminAccess(userId);

  return <NavbarClient canAccessAdmin={canAccessAdmin} />;
}
