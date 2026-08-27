import Container from "./ui/Container";
import { business } from "@/lib/business";

export default function VisitInfo() {
  return (
    <section className="border-t border-border bg-muted-soft">
      <Container className="py-16 sm:py-20">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Visit us
        </h2>
        <p className="mt-2 max-w-xl text-muted">
          Walk in or book online — we look forward to seeing you.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide">
              Location
            </h3>
            <address className="mt-2 space-y-1 not-italic text-muted">
              <p>{business.addressLine1}</p>
              {business.addressLine2 && <p>{business.addressLine2}</p>}
            </address>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide">
              Hours
            </h3>
            <p className="mt-2 text-muted">
              {business.hoursDays}
              <br />
              {business.hoursTime}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide">
              Contact
            </h3>
            <a
              href={business.phoneHref}
              className="mt-2 inline-block font-medium text-primary transition-colors hover:text-primary-strong"
            >
              {business.phoneDisplay}
            </a>
            <p className="mt-1 text-sm text-muted">
              Call us with any questions before booking.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
