"use client";

import { useState } from "react";
import {
  updateRoleAction,
  disableUserAction,
  restoreUserAction,
} from "@/app/actions/users";
import AuthStatusBadge from "@/components/auth/AuthStatusBadge";
import { GENERIC_FORM_ERROR, logClientError } from "@/lib/errors";
import { Button, EmptyState, FormBanner, Select } from "@/components/ui";
import type { AppUserSummary } from "@/lib/db/users";
import type { UserRole } from "@/lib/auth";

export type StaffUser = AppUserSummary;

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "staff", label: "Staff" },
  { value: "customer", label: "Customer" },
];

export default function StaffTable({
  users,
  currentClerkUserId,
}: {
  users: StaffUser[];
  currentClerkUserId: string;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (
    id: string,
    action: () => Promise<{ ok: boolean; error?: string }>
  ) => {
    setBusy(id);
    setError(null);
    try {
      const result = await action();

      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }

      window.location.reload();
    } catch (err) {
      logClientError("action:staffMutation", err);
      setError(GENERIC_FORM_ERROR);
    } finally {
      setBusy(null);
    }
  };

  const handleRoleChange = (user: StaffUser, role: UserRole) => {
    if (role === user.role) return;
    run(user.clerkUserId, () => updateRoleAction(user.clerkUserId, role));
  };

  const handleDisable = (user: StaffUser) => {
    if (!window.confirm(`Disable ${user.name ?? user.email ?? "this user"}? Their booking history stays intact, but they lose all access.`)) {
      return;
    }
    run(user.clerkUserId, () => disableUserAction(user.clerkUserId));
  };

  const handleRestore = (user: StaffUser) => {
    run(user.clerkUserId, () => restoreUserAction(user.clerkUserId));
  };

  return (
    <div className="space-y-4">
      {error && <FormBanner tone="danger">{error}</FormBanner>}

      {users.length === 0 ? (
        <EmptyState title="No accounts yet. Invite your first staff member above." />
      ) : (
        <ul className="space-y-3">
          {users.map((user) => {
            const isSelf = user.clerkUserId === currentClerkUserId;
            const isProtected = user.role === "super_admin";

            return (
              <li
                key={user.clerkUserId}
                className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-background p-4"
              >
                <div className="min-w-[200px] flex-1">
                  <p className="font-medium text-foreground">
                    {user.name ?? "Unnamed account"}
                    {isSelf && <span className="ml-2 text-xs text-muted">(you)</span>}
                  </p>
                  <p className="text-sm text-muted">{user.email ?? "No email on file"}</p>
                  <p className="mt-1 text-xs text-muted">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <AuthStatusBadge role={user.role} status={user.status} size="sm" />

                <div className="flex items-center gap-2">
                  {isProtected ? (
                    <span className="text-sm text-muted">Managed outside the app</span>
                  ) : isSelf ? (
                    <span className="text-sm text-muted">Cannot change your own access</span>
                  ) : (
                    <>
                      <label htmlFor={`role-${user.clerkUserId}`} className="sr-only">
                        Change role
                      </label>
                      <Select
                        id={`role-${user.clerkUserId}`}
                        value={user.role === "admin" ? "admin" : user.role}
                        disabled={busy === user.clerkUserId || user.role === "admin"}
                        onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                        className="disabled:opacity-60"
                      >
                        {user.role === "admin" ? (
                          <option value="admin">Admin</option>
                        ) : (
                          ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))
                        )}
                      </Select>

                      {user.status === "active" ? (
                        <Button
                          variant="danger"
                          size="md"
                          disabled={busy === user.clerkUserId}
                          onClick={() => handleDisable(user)}
                        >
                          {busy === user.clerkUserId ? "Working…" : "Disable"}
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="md"
                          disabled={busy === user.clerkUserId}
                          onClick={() => handleRestore(user)}
                        >
                          {busy === user.clerkUserId ? "Working…" : "Restore"}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}