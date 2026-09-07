"use client";

import { useState } from "react";
import { updateUserRole } from "@/features/auth/server";
import { UserRole } from "@/features/auth";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "customer", label: "Customer" },
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
];

export default function UserRoleSelector({ clerkUserId, currentRole }: { clerkUserId: string; currentRole: UserRole }) {
  const [saving, setSaving] = useState<UserRole | null>(null);

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === currentRole) return;
    setSaving(newRole);
    try {
      await updateUserRole(clerkUserId, newRole);
      window.location.reload();
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Failed to update role. Please try again.");
      setSaving(null);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted">Role:</span>
      <select
        value={currentRole}
        onChange={(e) => handleRoleChange(e.target.value as UserRole)}
        disabled={saving !== null}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {ROLE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {saving && <span className="text-xs text-muted">Updating…</span>}
    </div>
  );
}