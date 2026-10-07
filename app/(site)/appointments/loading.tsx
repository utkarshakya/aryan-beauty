import Container from "@/components/ui/Container";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

function CardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-card border border-border bg-background p-3 shadow-card sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
        <Skeleton className="h-6 w-20" rounded="control" />
      </div>
      <div className="mt-4 border-t border-border pt-3">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="mt-2 h-3 w-32" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <Container size="narrow" className="py-10 sm:py-16">
      <SkeletonGroup label="Loading appointments…">
        <div className="mx-auto mb-7 max-w-2xl text-center sm:mb-10">
          <Skeleton className="mx-auto h-8 w-52 sm:h-9" />
          <Skeleton className="mx-auto mt-3 h-4 w-72 max-w-full sm:h-5" />
        </div>

        <Skeleton className="h-6 w-52 sm:h-7" />

        <div
          className="mt-3 rounded-card border border-border bg-background p-4 shadow-card sm:p-6"
          aria-hidden="true"
        >
          <Skeleton className="h-11 w-full" rounded="control" />
          <div className="mt-3 flex gap-3">
            <Skeleton className="h-11 w-32" rounded="control" />
            <Skeleton className="h-11 w-32" rounded="control" />
            <Skeleton className="h-11 w-32" rounded="control" />
          </div>
          <Skeleton className="mt-4 h-4 w-40" />
        </div>

        <Skeleton className="mt-7 h-6 w-32 sm:mt-10" />
        <div className="space-y-3" aria-hidden="true">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </SkeletonGroup>
    </Container>
  );
}
