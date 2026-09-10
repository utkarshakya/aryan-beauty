import type { Metadata } from "next";
import Link from "next/link";
import { requireOwnerAdmin } from "@/lib/auth";
import { getBusinessSettingsAction } from "@/app/actions/business";
import BusinessSettingsForm from "@/components/business/BusinessSettingsForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Business Settings",
  description: "Manage the parlour's business information, hours, and booking rules.",
};

export default async function BusinessSettingsPage() {
  await requireOwnerAdmin();
  const settings = await getBusinessSettingsAction();

  return (
    <div className="container mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin" className="text-sm font-medium text-primary hover:text-primary-strong">
            ← Back to dashboard
          </Link>
          <h1 className="mt-2 text-xl font-bold text-foreground sm:mt-3 sm:text-3xl">Business settings</h1>
          <p className="mt-1 text-sm text-muted sm:mt-2 sm:text-base">Manage your parlour&apos;s information, opening hours, and booking rules.</p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-background p-4 shadow-sm sm:p-6" aria-labelledby="settings-heading">
        <h2 id="settings-heading" className="sr-only">Business settings form</h2>
        <BusinessSettingsForm settings={settings} />
      </section>
    </div>
  );
}