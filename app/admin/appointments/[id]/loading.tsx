import Container from "@/components/ui/Container";
import { cardClassName } from "@/components/ui";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <Container className="py-4 sm:py-8">
      <SkeletonGroup label="Loading appointment…">
        <Skeleton className="mb-1 h-6 w-40" />
        <Skeleton className="h-8 w-64 sm:h-9" />
        <Skeleton className="mt-3 h-4 w-48" />

        <div className={cardClassName("mt-6 p-4 sm:p-6")}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-4 w-28" />
            </div>
            <Skeleton className="h-7 w-24" rounded="full" />
          </div>

          <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-2 h-4 w-40" />
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-border pt-5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-5">
            <Skeleton className="h-11 w-36" rounded="full" />
            <Skeleton className="h-11 w-28" rounded="full" />
            <Skeleton className="h-11 w-32" rounded="full" />
          </div>
        </div>
      </SkeletonGroup>
    </Container>
  );
}
