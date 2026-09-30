import type { Metadata } from "next";
import { requireOwnerAdmin } from "@/lib/auth";
import { getStaffUsersAction } from "@/app/actions/users";
import { PageHeader, SectionHeading, cardClassName } from "@/components/ui";
import StaffInviteForm from "@/components/staff/StaffInviteForm";
import StaffTable from "@/components/staff/StaffTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage Staff",
  description: "Invite staff and control who can access the parlour workspace.",
};

export default async function ManageStaffPage() {
  const currentClerkUserId = await requireOwnerAdmin();
  const users = await getStaffUsersAction();

  return (
    <div className="container mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-8">
      <PageHeader
        backHref="/admin"
        backLabel="Back to dashboard"
        title="Manage staff"
        subtitle="Invite workers and decide who can use the parlour workspace."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
        <section aria-labelledby="staff-heading">
          <SectionHeading id="staff-heading" title="Accounts" />
          <StaffTable users={users} currentClerkUserId={currentClerkUserId} />
        </section>

        <section
          className={cardClassName("h-fit p-4 sm:p-6")}
          aria-labelledby="invite-heading"
        >
          <SectionHeading
            id="invite-heading"
            title="Invite staff"
            description="They get an email, sign up, and land on the workspace automatically."
          />
          <StaffInviteForm />
        </section>
      </div>
    </div>
  );
}