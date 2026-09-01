import Container from "./ui/Container";
import { ButtonLink } from "./ui/Button";
import { business } from "@/lib/business";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-primary-soft dark:bg-[#17131a]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-40 hidden h-80 w-80 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl dark:block"
      />
      <Container className="relative py-12 text-center sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Discover Your Natural Beauty
          </h1>
          <p className="mt-3 text-base text-muted sm:mt-4 sm:text-xl">
            {business.description}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:mt-8 sm:flex-row sm:gap-3">
            <ButtonLink
              href="/book"
              size="lg"
              className="w-full max-w-[320px] sm:w-auto sm:max-w-none"
            >
              Book Appointment
            </ButtonLink>
            <ButtonLink
              href="/services"
              variant="secondary"
              size="lg"
              className="w-full max-w-[320px] sm:w-auto sm:max-w-none dark:bg-[#2b2530] dark:text-primary dark:hover:bg-[#3b3342]"
            >
              View Services
            </ButtonLink>
          </div>
          <p className="mt-6 text-xs text-muted sm:mt-8 sm:text-sm">
            Open {business.hoursDays}, {business.hoursTime} ·{" "}
            {business.addressLine1}
          </p>
        </div>
      </Container>
    </section>
  );
}
