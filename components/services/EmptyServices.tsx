import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui";

export default function EmptyServices({
  phoneDisplay,
  phoneHref,
}: {
  phoneDisplay: string;
  phoneHref: string;
}) {
  return (
    <EmptyState
      className="p-6 sm:p-12"
      title="Our service menu is being updated"
      body={
        <>
          We haven&apos;t published our services yet. Please call us and we&apos;ll
          be happy to help you book your visit.
        </>
      }
      actions={
        <>
          <ButtonLink href={phoneHref} variant="secondary">
            Call {phoneDisplay}
          </ButtonLink>
          <ButtonLink href="/" variant="ghost">
            Back to home
          </ButtonLink>
        </>
      }
    />
  );
}
