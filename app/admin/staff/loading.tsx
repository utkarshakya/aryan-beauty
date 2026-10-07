import Container from "@/components/ui/Container";
import { cardClassName } from "@/components/ui";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <Container className="py-4 sm:py-8">
      <SkeletonGroup label="Loading staff…">
        <Skeleton className="mb-1 h-6 w-32" />
        <Skeleton className="h-8 w-48 sm:h-9" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
          <div>
            <Skeleton className="h-6 w-28" />
            <div className={cardClassName("mt-4 overflow-hidden p-0")}>
              <div className="hidden gap-4 border-b border-border px-4 py-3 md:flex">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="ml-auto h-4 w-24" />
              </div>
              <div className="divide-y divide-border">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-center gap-3 px-4 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="mt-2 h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20" rounded="full" />
                    <div className="flex gap-3">
                      <Skeleton className="h-11 w-16" />
                      <Skeleton className="h-11 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={cardClassName("h-fit p-4 sm:p-6")}>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-2 h-3 w-56" />
            <div className="mt-5 space-y-4">
              <div>
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="h-11 w-full" rounded="control" />
              </div>
              <Skeleton className="h-11 w-full" rounded="full" />
            </div>
          </div>
        </div>
      </SkeletonGroup>
    </Container>
  );
}
