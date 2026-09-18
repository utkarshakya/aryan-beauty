import type { Metadata } from "next";
import Link from "next/link";
import { requireOwnerAdmin } from "@/lib/auth";
import { getStaffUsersAction } from "@/app/actions/users";
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
      <div className="mb-8">
        <Link href="/admin" className="text-sm font-medium text-primary hover:text-primary-strong">
          ← Back to appointments
        </Link>
        <h1 className="mt-2 text-xl font-bold text-foreground sm:mt-3 sm:text-3xl">Manage staff</h1>
        <p className="mt-1 text-sm text-muted sm:mt-2 sm:text-base">
          Invite workers and decide who can use the parlour workspace.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
        <section className="space-y-4" aria-labelledby="staff-heading">
          <h2 id="staff-heading" className="text-lg font-semibold text-foreground">Accounts</h2>
          <StaffTable users={users} currentClerkUserId={currentClerkUserId} />
        </section>

        <section
          className="h-fit rounded-xl border border-border bg-background p-4 shadow-sm sm:p-6"
          aria-labelledby="invite-heading"
        >
          <h2 id="invite-heading" className="text-lg font-semibold text-foreground">Invite staff</h2>
          <p className="mt-1 text-sm text-muted">
            They get an email, sign up, and land on the workspace automatically.
          </p>
          <div className="mt-4">
            <StaffInviteForm />
          </div>
        </section>
      </div>
    </div>
  );
}