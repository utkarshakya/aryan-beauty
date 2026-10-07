"use client";

import { useActionState } from "react";
import { inviteStaffAction } from "@/app/actions/users";
import { Button, Field, FormBanner, Input } from "@/components/ui";

const initialState: { errors?: Record<string, string>; success?: string } = {};

export default function StaffInviteForm() {
  const [state, formAction, pending] = useActionState(
    inviteStaffAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field
          label="Staff email"
          error={state.errors?.email}
          className="sm:flex-1"
        >
          <Input
            id="staff-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            enterKeyHint="send"
            placeholder="worker@example.com"
          />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send invitation"}
        </Button>
      </div>

      {state.success && <FormBanner>{state.success}</FormBanner>}
    </form>
  );
}
