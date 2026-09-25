"use client";

import { useState } from "react";
import { createServiceAction } from "@/app/actions/services";
import { Button } from "@/components/ui";

export default function ServiceForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [price, setPrice] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name || name.length > 100) newErrors.name = "Enter a service name (max 100 chars)";
    if (!Number.isFinite(Number(price)) || Number(price) < 0) newErrors.price = "Enter a valid price";
    if (!Number.isInteger(Number(durationMin)) || Number(durationMin) <= 0) newErrors.durationMin = "Enter a valid duration in minutes";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("description", description);
      formData.set("category", category);
      formData.set("price", price);
      formData.set("durationMin", durationMin);
      formData.set("active", String(active));
      const result = await createServiceAction({ errors: {} }, formData);
      if (result.errors) {
        setErrors(result.errors);
      } else {
        setSuccess(true);
        setName("");
        setDescription("");
        setCategory("Other");
        setPrice("");
        setDurationMin("");
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClasses = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-ring";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="rounded-lg bg-success-soft px-4 py-3 text-sm text-success" role="status">
          Service created successfully
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClasses}
        />
        {errors.name && <p className="mt-1.5 text-sm text-danger">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Category</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClasses}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground">Price</label>
          <input
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className={inputClasses}
          />
          {errors.price && <p className="mt-1.5 text-sm text-danger">{errors.price}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Minutes</label>
          <input
            type="number"
            min="1"
            step="1"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            required
            className={inputClasses}
          />
          {errors.durationMin && <p className="mt-1.5 text-sm text-danger">{errors.durationMin}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={inputClasses}
        />
      </div>

      <div className="flex items-center gap-2">
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

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Adding…" : "Add service"}
      </Button>
    </form>
  );
}
