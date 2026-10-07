import Container from "@/components/ui/Container";
import { cardClassName } from "@/components/ui";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <Container className="py-5 sm:py-8">
      <SkeletonGroup label="Loading dashboard…">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-8 w-64 sm:h-9" />
            <Skeleton className="mt-3 h-4 w-72 max-w-full" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-11 w-36" rounded="full" />
            <Skeleton className="h-11 w-40" rounded="full" />
            <Skeleton className="h-11 w-32" rounded="full" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-4 sm:gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={cardClassName("p-3 sm:p-5")}>
              <Skeleton className="h-3 w-14" />
              <Skeleton className="mt-2 h-8 w-10" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          ))}
        </div>

        <div className={cardClassName("mt-6 p-4 sm:mt-8 sm:p-6")}>
          <Skeleton className="h-6 w-40" />
          <div className="mt-4 divide-y divide-border">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="mt-2 h-3 w-1/4" />
                </div>
                <div className="shrink-0 text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                  <Skeleton className="mt-2 ml-auto h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Skeleton className="mb-5 mt-8 h-7 w-44 sm:mt-10" />
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1 sm:max-w-md">
            <Skeleton className="mb-2 h-4 w-16" />
            <Skeleton className="h-11 w-full" rounded="control" />
          </div>
          <Skeleton className="h-11 w-24" rounded="full" />
        </div>
        <div className="mb-4 flex flex-wrap items-end gap-2">
          <Skeleton className="h-11 w-24" />
          <Skeleton className="h-11 w-28" />
          <div>
            <Skeleton className="mb-2 h-4 w-12" />
            <Skeleton className="h-11 w-40" rounded="control" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={cardClassName("flex items-center gap-3 p-4")}
            >
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-20" rounded="full" />
            </div>
          ))}
        </div>
      </SkeletonGroup>
    </Container>
  );
}
