"use client";

import { useActionState, useState } from "react";
import { updateMyProfile } from "@/app/actions/customers";
import { Button, Field, Input } from "@/components/ui";

const initialState = { errors: {} as Record<string, string> };

export default function CustomerProfileForm({ initialData }: { initialData: { name: string; phone: string | null; email: string | null } }) {
  const [state, formAction, pending] = useActionState(updateMyProfile, initialState);
  const [name, setName] = useState(initialData.name);
  const [phone, setPhone] = useState(initialData.phone ?? "");
  const [email, setEmail] = useState(initialData.email ?? "");

  const errors = state.errors ?? {};

  const handleSubmit = (formData: FormData) => {
    formData.set("name", name);
    formData.set("phone", phone);
    formData.set("email", email);
    formAction(formData);
  };

  if (state.success) {
    return (
      <div className="rounded-xl border border-success/30 bg-success-soft p-4" role="status" aria-live="polite">
        <p className="font-medium text-foreground">{state.success}</p>
        <Button type="button" variant="secondary" className="mt-3" onClick={() => window.location.reload()}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {errors.form && (
        <div className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
          {errors.form}
        </div>
      )}

      <Field label="Name" error={errors.name}>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Field>

      <Field
        label={
          <>
            Mobile <span className="font-normal text-muted">(optional)</span>
          </>
        }
        error={errors.phone}
      >
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="numeric"
          placeholder="10-digit mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </Field>

      <Field
        label={
          <>
            Email <span className="font-normal text-muted">(optional)</span>
          </>
        }
      >
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
