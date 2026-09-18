import type { UserRole } from "@prisma/client";

const INVITE_ROLES = new Set<string>(["staff", "customer", "admin"]);

export function roleFromPublicMetadata(value: unknown): UserRole {
  return typeof value === "string" && INVITE_ROLES.has(value)
    ? (value as UserRole)
    : "customer";
}