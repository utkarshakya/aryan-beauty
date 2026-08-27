import { ButtonLink } from "./ui/Button";
import { business } from "@/lib/business";

export default function EmptyServices() {
  return (
    <div className="rounded-xl border border-border bg-muted-soft p-8 text-center sm:p-12">
      <h2 className="text-xl font-semibold">Our service menu is being updated</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
        We haven&apos;t published our services yet. Please call us and we&apos;ll
        be happy to help you book your visit.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <ButtonLink href={business.phoneHref} variant="secondary">
          Call {business.phoneDisplay}
        </ButtonLink>
        <ButtonLink href="/" variant="ghost">
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}
