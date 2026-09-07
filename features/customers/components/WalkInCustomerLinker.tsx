"use client";

import { useState, useEffect } from "react";
import { getWalkInCustomersAction, linkWalkInCustomerAction } from "../actions";
import { WalkInCustomer } from "../types";
import { Button } from "@/shared/ui";

export default function WalkInCustomerLinker() {
  const [walkInCustomers, setWalkInCustomers] = useState<WalkInCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkingId, setLinkingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getWalkInCustomersAction().then((customers) => {
      if (mounted) setWalkInCustomers(customers);
    }).catch(() => {
      if (mounted) setErrors({ form: "Failed to load walk-in customers" });
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const handleLink = async (customerId: number, clerkUserId: string) => {
    setLinkingId(customerId);
    setErrors({});
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.set("customerId", String(customerId));
      formData.set("clerkUserId", clerkUserId);
      const result = await linkWalkInCustomerAction({ errors: {} }, formData);
      if (result.errors) {
        setErrors(result.errors);
      } else {
        setSuccess(result.success ?? "Walk-in customer linked successfully");
        // Refresh the list
        const customers = await getWalkInCustomersAction();
        setWalkInCustomers(customers);
      }
    } finally {
      setLinkingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Unlinked Walk-in Customers</h3>
        <Button variant="secondary" size="md" disabled={loading} onClick={() => {
          setLoading(true);
          setErrors({});
          setSuccess(null);
          getWalkInCustomersAction().then((customers) => {
            setWalkInCustomers(customers);
            setLoading(false);
          }).catch(() => {
            setErrors({ form: "Failed to load walk-in customers" });
            setLoading(false);
          });
        }}>
          {loading ? "Loading…" : "Refresh"}
        </Button>
      </div>

      {errors.form && (
        <div className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
          {errors.form}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-success-soft px-4 py-3 text-sm text-success" role="status">
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-muted">Loading walk-in customers…</div>
      ) : walkInCustomers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          No unlinked walk-in customers.
        </div>
      ) : (
        <div className="space-y-3">
          {walkInCustomers.map((customer) => (
            <div
              key={customer.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background p-4"
            >
              <div className="flex-1 min-w-[200px]">
                <p className="font-medium text-foreground">{customer.name}</p>
                <p className="text-sm text-muted">
                  {customer.phone} · {customer.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor={`clerk-${customer.id}`} className="text-sm text-muted">
                  Clerk User ID:
                </label>
                <input
                  id={`clerk-${customer.id}`}
                  type="text"
                  placeholder="user_..."
                  required
                  className="w-[200px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <Button
                  size="md"
                  disabled={linkingId === customer.id}
                  onClick={(e) => {
                    e.preventDefault();
                    const input = document.getElementById(`clerk-${customer.id}`) as HTMLInputElement;
                    if (input?.value) handleLink(customer.id, input.value);
                  }}
                >
                  {linkingId === customer.id ? "Linking…" : "Link"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}