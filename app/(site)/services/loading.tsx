import Container from "@/components/ui/Container";

function Bar({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-full bg-muted-soft ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <Container className="py-12 sm:py-20">
      <div role="status">
        <span className="sr-only">Loading services…</span>

        <div className="mx-auto mb-7 max-w-2xl text-center sm:mb-10">
          <Bar className="mx-auto h-8 w-48 sm:h-9" />
          <Bar className="mx-auto mt-3 h-4 w-72 max-w-full sm:h-5" />
        </div>

        <div className="mb-3 flex justify-center gap-2">
          <Bar className="h-8 w-16" />
          <Bar className="h-8 w-20" />
          <Bar className="h-8 w-24" />
          <Bar className="h-8 w-16" />
        </div>
        <div className="mb-7 flex justify-center sm:mb-10">
          <Bar className="h-4 w-32" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              aria-hidden="true"
              className="rounded-card border border-border bg-background p-4 shadow-card sm:p-6"
            >
              <Bar className="h-3 w-20" />
              <Bar className="mt-2 h-5 w-2/3" />
              <div className="mt-3 space-y-2">
                <Bar className="h-3 w-full rounded-full" />
                <Bar className="h-3 w-5/6" />
              </div>
              <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
                <Bar className="h-6 w-20" />
                <Bar className="h-4 w-12" />
              </div>
              <Bar className="mt-5 h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
