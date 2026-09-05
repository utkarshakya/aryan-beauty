"use client";

import { useUser } from "@clerk/nextjs";
import { UserRole } from "@/features/auth/types";

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();

  const role = (user?.publicMetadata?.role as UserRole) ?? "customer";
  const status = (user?.publicMetadata?.status as "active" | "disabled") ?? "active";

  const hasRole = (requiredRoles: UserRole | UserRole[]) => {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(role);
  };

  const isAdmin = hasRole(["super_admin", "admin"]);
  const isStaff = hasRole(["super_admin", "admin", "staff"]);
  const isActive = status === "active";

  return {
    user,
    isLoaded,
    isSignedIn,
    role,
    status,
    hasRole,
    isAdmin,
    isStaff,
    isActive,
    canAccessAdmin: isActive && isStaff,
    canManageServices: isActive && isAdmin,
  };
}