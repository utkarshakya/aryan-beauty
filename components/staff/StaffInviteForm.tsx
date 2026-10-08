"use client";

import { useEffect, useActionState } from "react";
import { inviteStaffAction } from "@/app/actions/users";
import { Button, Field, Input, useToast } from "@/components/ui";

const initialState: { errors?: Record<string, string>; success?: string } = {};

export default function StaffInviteForm() {
  const [state, formAction, pending] = useActionState(
    inviteStaffAction,
    initialState
  );
  const toast = useToast();

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
    }
  }, [state, toast]);

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
    </form>
  );
}
