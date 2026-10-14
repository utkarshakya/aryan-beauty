import type { Metadata } from "next";
import { requireOwnerAdmin } from "@/lib/auth";
import { getBusinessSettingsAction } from "@/app/actions/business";
import { PageHeader, cardClassName } from "@/components/ui";
import Container from "@/components/ui/Container";
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
    <Container size="wide" className="py-4 sm:py-8">
      <PageHeader
        title="Business settings"
        subtitle="Manage your parlour&apos;s information, opening hours, and booking rules."
      />

      <section className={cardClassName("p-4 sm:p-6")} aria-labelledby="settings-heading">
        <h2 id="settings-heading" className="sr-only">Business settings form</h2>
        <BusinessSettingsForm settings={settings} />
      </section>
    </Container>
  );
}