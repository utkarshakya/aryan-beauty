"use client";

import { useState } from "react";
import { createServiceAction } from "@/app/actions/services";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { Button, Field, FormBanner, Input, Select, Textarea, checkboxClass } from "@/components/ui";

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
    if (price.trim() === "") newErrors.price = "Enter a price";
    else if (!Number.isInteger(Number(price)) || Number(price) < 0)
      newErrors.price = "Price must be a whole number of rupees";
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <FormBanner>Service created successfully</FormBanner>
      )}

      <Field label="Name" error={errors.name}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Field>

      <Field label="Category" error={errors.category}>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Price" error={errors.price}>
          <Input
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </Field>
        <Field label="Minutes" error={errors.durationMin}>
          <Input
            type="number"
            min="1"
            step="1"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            required
          />
        </Field>
      </div>

      <Field label="Description">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </Field>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className={checkboxClass}
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
