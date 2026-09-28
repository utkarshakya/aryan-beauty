"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateServiceAction, toggleServiceAction } from "@/app/actions/services";
import { Service } from "@prisma/client";
import { Button, Field, Input, Textarea } from "@/components/ui";

export default function ServiceEditor({ service }: { service: Service }) {
  const [editing, setEditing] = useState(false);

  return (
    <article className="rounded-xl border border-border bg-background p-4 shadow-sm sm:p-5">
      {!editing ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{service.name}</h3>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${service.active ? "bg-success-soft text-success" : "bg-neutral-soft text-neutral"}`}>
                {service.active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">{service.category} · ₹{Math.round(service.price)} · {service.durationMin} minutes</p>
            {service.description && <p className="mt-3 text-sm text-foreground">{service.description}</p>}
          </div>
          <Button type="button" variant="secondary" size="md" onClick={() => setEditing(true)}>
            Edit
          </Button>
        </div>
      ) : (
        <ServiceEditForm service={service} onCancel={() => setEditing(false)} />
      )}
    </article>
  );
}

function ServiceEditForm({ service, onCancel }: { service: Service; onCancel: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description);
  const [category, setCategory] = useState(service.category);
  const [price, setPrice] = useState(service.price);
  const [durationMin, setDurationMin] = useState(service.durationMin);
  const [active, setActive] = useState(service.active);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name || name.length > 100) newErrors.name = "Enter a service name (max 100 chars)";
    if (!Number.isFinite(price) || price < 0) newErrors.price = "Enter a valid price";
    if (!Number.isInteger(durationMin) || durationMin <= 0) newErrors.durationMin = "Enter a valid duration in minutes";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("description", description);
      formData.set("category", category);
      formData.set("price", String(price));
      formData.set("durationMin", String(durationMin));
      formData.set("active", String(active));
      const result = await updateServiceAction(service.id, { errors: {} }, formData);
      if (result.errors) {
        setErrors(result.errors);
      } else {
        onCancel();
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    setSaving(true);
    try {
      const result = await toggleServiceAction(service.id, !active);
      if (result.errors) {
        setErrors(result.errors);
        return;
      }

      setActive(!active);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-foreground">Edit service</h3>
        <Button type="button" variant="ghost" size="md" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name" error={errors.name}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>
        <Field label="Category">
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </Field>
        <Field label="Price" error={errors.price}>
          <Input
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
          />
        </Field>
        <Field label="Duration (minutes)" error={errors.durationMin}>
          <Input
            type="number"
            min="1"
            step="1"
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value))}
            required
          />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </Field>
        <div className="sm:col-span-2 flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-border text-primary focus-ring"
            />
            Active
          </label>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-3 border-t border-border pt-4">
        <Button type="button" variant="secondary" onClick={handleToggle} disabled={saving}>
          {active ? "Deactivate" : "Activate"}
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </>
  );
}
