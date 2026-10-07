import Container from "@/components/ui/Container";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { serviceGridClasses } from "@/app/components/serviceGrid";

export default function Loading() {
  return (
    <Container className="py-12 sm:py-20">
      <SkeletonGroup label="Loading services…">
        <div className="mx-auto mb-7 max-w-2xl text-center sm:mb-10">
          <Skeleton className="mx-auto h-8 w-48 sm:h-9" />
          <Skeleton className="mx-auto mt-3 h-4 w-72 max-w-full sm:h-5" />
        </div>

        <div className="mb-3 flex justify-center gap-2">
          <Skeleton className="h-11 w-16" />
          <Skeleton className="h-11 w-20" />
          <Skeleton className="h-11 w-24" />
          <Skeleton className="h-11 w-16" />
        </div>
        <div className="mb-7 flex justify-center sm:mb-10">
          <Skeleton className="h-4 w-32" />
        </div>

        <div className={serviceGridClasses}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              aria-hidden="true"
              className="rounded-card border border-border bg-background p-4 shadow-card sm:p-6"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-5 w-2/3" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
              <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="mt-5 h-10 w-full" rounded="control" />
            </div>
          ))}
        </div>
      </SkeletonGroup>
    </Container>
  );
}
