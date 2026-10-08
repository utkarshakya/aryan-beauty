"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import { cancelMyAppointment } from "@/app/actions/appointments";
import { ActionButton, ConfirmDialog, useToast } from "@/components/ui";
import type { CancellationState } from "@/lib/db/appointments";

const initialState: CancellationState = {};

export default function CancelAppointmentButton({
  appointmentId,
}: {
  appointmentId: number;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    cancelMyAppointment,
    initialState,
  );
  const toast = useToast();

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
    }
  }, [state, toast]);

  return (
    <>
      <form ref={formRef} action={formAction}>
        <input type="hidden" name="appointmentId" value={appointmentId} />
        <ActionButton
          type="button"
          tone="danger"
          disabled={pending}
          onClick={() => setOpen(true)}
        >
          {pending ? "Cancelling…" : "Cancel appointment"}
        </ActionButton>
        {state.error && (
          <p className="mt-2 text-sm text-danger" role="alert">
            {state.error}
          </p>
        )}
      </form>
      <ConfirmDialog
        open={open}
        title="Cancel this appointment?"
        body="You can book another time whenever it suits you."
        confirmLabel="Cancel appointment"
        cancelLabel="Keep it"
        tone="danger"
        onConfirm={() => {
          setOpen(false);
          formRef.current?.requestSubmit();
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
