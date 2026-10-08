"use client";

import { useState } from "react";
import { restoreAppointmentAction } from "@/app/actions/appointments";
import { GENERIC_FORM_ERROR, logClientError } from "@/lib/errors";
import { ActionButton, ConfirmDialog, useToast } from "@/components/ui";

export default function RestoreButton({
  appointmentId,
}: {
  appointmentId: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const toast = useToast();

  const handleConfirm = async () => {
    setOpen(false);
    if (pending) return;
    setPending(true);
    try {
      const result = await restoreAppointmentAction(appointmentId);
      if (result.ok) {
        toast.success("Appointment restored.");
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      logClientError("action:restoreAppointment", error);
      toast.error(GENERIC_FORM_ERROR);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <ActionButton
        type="button"
        tone="primary"
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        {pending ? "Restoring…" : "Restore"}
      </ActionButton>
      <ConfirmDialog
        open={open}
        title="Restore this appointment as confirmed?"
        body="It goes back to the confirmed state and shows up as upcoming."
        confirmLabel="Restore"
        cancelLabel="Cancel"
        tone="primary"
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
