import type { UserRole } from "@prisma/client";
import { GRANTABLE_ROLES } from "@/lib/constants";

const INVITE_ROLES = new Set<string>(GRANTABLE_ROLES);

export function roleFromPublicMetadata(value: unknown): UserRole {
  return typeof value === "string" && INVITE_ROLES.has(value)
    ? (value as UserRole)
    : "customer";
}