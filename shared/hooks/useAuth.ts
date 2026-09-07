import { useUser } from "@clerk/nextjs";
import { UserRole, UserStatus } from "../types/auth";

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  staff: "Staff",
  customer: "Customer",
};

export interface AuthContext {
  user: ReturnType<typeof useUser>["user"];
  isLoaded: boolean;
  isSignedIn: boolean;
  role: UserRole;
  status: UserStatus;
  roleLabel: string;
  hasRole: (requiredRoles: UserRole | UserRole[]) => boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isActive: boolean;
  canAccessAdmin: boolean;
  canManageServices: boolean;
}

export function useAuth(): AuthContext {
  const { user, isLoaded, isSignedIn } = useUser();

  const role = (user?.publicMetadata?.role as UserRole) ?? "customer";
  const status = (user?.publicMetadata?.status as UserStatus) ?? "active";

  const hasRole = (requiredRoles: UserRole | UserRole[]) => {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(role);
  };

  return {
    user,
    isLoaded,
    isSignedIn: !!isSignedIn,
    role,
    status,
    roleLabel: ROLE_LABELS[role] ?? role,
    hasRole,
    isAdmin: hasRole(["super_admin", "admin"]),
    isStaff: hasRole(["super_admin", "admin", "staff"]),
    isActive: status === "active",
    canAccessAdmin: status === "active" && hasRole(["super_admin", "admin", "staff"]),
    canManageServices: status === "active" && hasRole(["super_admin", "admin"]),
  };
}