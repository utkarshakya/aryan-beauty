import Link from "next/link";
import Container from "./ui/Container";
import { business } from "@/lib/business";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted-soft">
      <Container className="py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
          <div>
            <p className="text-lg font-bold tracking-tight">
              Unknown <span className="text-primary">Beauty</span>
            </p>
            <p className="mt-2 text-sm text-muted">{business.tagline}.</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Visit
            </h2>
            <address className="mt-2 space-y-1 text-sm not-italic text-muted">
              <p>
                {business.addressLine1}
                {business.addressLine2 ? `, ${business.addressLine2}` : ""}
              </p>
              <p>
                {business.hoursDays}: {business.hoursTime}
              </p>
            </address>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Contact
            </h2>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              <li>
                <a
                  href={business.phoneHref}
                  className="font-medium text-primary transition-colors hover:text-primary-strong"
                >
                  {business.phoneDisplay}
                </a>
              </li>
              <li>
                <Link
                  href="/services"
                  className="transition-colors hover:text-foreground"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/book"
                  className="transition-colors hover:text-foreground"
                >
                  Book an appointment
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-8 border-t border-border pt-5 text-xs text-muted">
          © {new Date().getFullYear()} {business.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
