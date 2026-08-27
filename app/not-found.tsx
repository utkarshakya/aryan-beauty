import Link from "next/link";
import { ButtonLink } from "./components/ui/Button";
import { business } from "@/lib/business";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-primary">
        {business.name}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <ButtonLink href="/">Go home</ButtonLink>
        <ButtonLink href="/services" variant="secondary">
          View services
        </ButtonLink>
      </div>
      <p className="mt-8 text-sm text-muted">
        Looking for something?{" "}
        <Link
          href="/book"
          className="font-medium text-primary transition-colors hover:text-primary-strong"
        >
          Book an appointment
        </Link>
      </p>
    </main>
  );
}
