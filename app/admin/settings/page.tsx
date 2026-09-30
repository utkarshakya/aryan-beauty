import type { Metadata } from "next";
import { requireOwnerAdmin } from "@/lib/auth";
import { getBusinessSettingsAction } from "@/app/actions/business";
import { PageHeader, cardClassName } from "@/components/ui";
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
      <PageHeader
        backHref="/admin"
        backLabel="Back to dashboard"
        title="Business settings"
        subtitle="Manage your parlour&apos;s information, opening hours, and booking rules."
      />

      <section className={cardClassName("p-4 sm:p-6")} aria-labelledby="settings-heading">
        <h2 id="settings-heading" className="sr-only">Business settings form</h2>
        <BusinessSettingsForm settings={settings} />
      </section>
    </div>
  );
}