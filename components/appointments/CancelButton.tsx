"use client";

import { useState } from "react";
import { adminCancelAppointment as cancelAppointment } from "@/app/actions/appointments";
import { GENERIC_FORM_ERROR, logClientError } from "@/lib/errors";
import { ActionButton, ConfirmDialog, useToast } from "@/components/ui";

export default function CancelButton({ appointmentId }: { appointmentId: number }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const toast = useToast();

  const handleConfirm = async () => {
    setOpen(false);
    if (pending) return;
    setPending(true);
    try {
      const result = await cancelAppointment(appointmentId);
      if (result.ok) {
        toast.success("Appointment cancelled.");
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      logClientError("action:adminCancelAppointment", error);
      toast.error(GENERIC_FORM_ERROR);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <ActionButton
        type="button"
        tone="danger"
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        {pending ? "Cancelling…" : "Cancel"}
      </ActionButton>
      <ConfirmDialog
        open={open}
        title="Cancel this appointment?"
        body="The customer will see it as cancelled. You can restore it later while the visit is still upcoming."
        confirmLabel="Cancel appointment"
        cancelLabel="Keep it"
        tone="danger"
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
