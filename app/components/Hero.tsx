import Container from "./ui/Container";
import { ButtonLink } from "./ui/Button";
import { business } from "@/lib/business";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-primary-soft dark:bg-[#17131a]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-10rem] hidden h-80 w-80 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl dark:block"
      />
      <Container className="relative py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Discover Your Natural Beauty
          </h1>
          <p className="mt-4 text-lg text-muted sm:text-xl">
            {business.description}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/book" size="lg" className="w-full sm:w-auto">
              Book Appointment
            </ButtonLink>
            <ButtonLink
              href="/services"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto dark:bg-[#2b2530] dark:text-primary dark:hover:bg-[#3b3342]"
            >
              View Services
            </ButtonLink>
          </div>
          <p className="mt-8 text-sm text-muted">
            Open {business.hoursDays}, {business.hoursTime} ·{" "}
            {business.addressLine1}
          </p>
        </div>
      </Container>
    </section>
  );
}
