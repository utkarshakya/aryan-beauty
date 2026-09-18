"use client";

import { useActionState } from "react";
import { inviteStaffAction } from "@/app/actions/users";
import { Button } from "@/components/ui";

const initialState: { errors?: Record<string, string>; success?: string } = {};

export default function StaffInviteForm() {
  const [state, formAction, pending] = useActionState(
    inviteStaffAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <label htmlFor="staff-email" className="block text-sm font-medium text-foreground">
        Staff email
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <input
          id="staff-email"
          name="email"
          type="email"
          required
          placeholder="worker@example.com"
          className="w-full flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send invitation"}
        </Button>
      </div>

      {state.errors?.email && (
        <p className="text-sm text-danger" role="alert">
          {state.errors.email}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-success" role="status">
          {state.success}
        </p>
      )}
    </form>
  );
}