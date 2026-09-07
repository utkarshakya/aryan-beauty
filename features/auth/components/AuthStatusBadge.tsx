"use client";

import { UserRole, UserStatus } from "@/features/auth";

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  staff: "Staff",
  customer: "Customer",
};

const ROLE_CLASSES: Record<UserRole, string> = {
  super_admin: "bg-purple-soft text-purple",
  admin: "bg-blue-soft text-blue",
  staff: "bg-green-soft text-green",
  customer: "bg-neutral-soft text-neutral",
};

const STATUS_CLASSES: Record<UserStatus, string> = {
  active: "bg-success-soft text-success",
  disabled: "bg-danger-soft text-danger",
};

interface AuthStatusBadgeProps {
  role: UserRole;
  status: UserStatus;
  showRole?: boolean;
  showStatus?: boolean;
  size?: "sm" | "md";
}

export default function AuthStatusBadge({
  role,
  status,
  showRole = true,
  showStatus = true,
  size = "md",
}: AuthStatusBadgeProps) {
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <div className="inline-flex items-center gap-1.5">
      {showRole && (
        <span className={`rounded-full font-medium ${ROLE_CLASSES[role]} ${padding}`}>
          {ROLE_LABELS[role]}
        </span>
      )}
      {showStatus && (
        <span className={`rounded-full font-medium ${STATUS_CLASSES[status]} ${padding}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )}
    </div>
  );
}