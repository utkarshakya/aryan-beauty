import Container from "@/components/ui/Container";
import { cardClassName } from "@/components/ui";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <Container className="py-4 sm:py-8">
      <SkeletonGroup label="Loading services…">
        <Skeleton className="mb-1 h-6 w-32" />
        <Skeleton className="h-8 w-56 sm:h-9" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />

        <div className="mt-6 grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
          <div>
            <Skeleton className="h-6 w-40" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className={cardClassName("p-4 sm:p-6")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="mt-2 h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-6 w-16" rounded="full" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Skeleton className="h-11 w-28" rounded="full" />
                    <Skeleton className="h-11 w-24" rounded="full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={cardClassName("h-fit p-4 sm:p-6")}>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="mt-2 h-3 w-56" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index}>
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="h-11 w-full" rounded="control" />
                </div>
              ))}
              <Skeleton className="h-11 w-full" rounded="full" />
            </div>
          </div>
        </div>
      </SkeletonGroup>
    </Container>
  );
}
