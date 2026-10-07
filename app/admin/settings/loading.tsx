import Container from "@/components/ui/Container";
import { cardClassName } from "@/components/ui";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <Container className="py-4 sm:py-8">
      <SkeletonGroup label="Loading business settings…">
        <Skeleton className="mb-1 h-6 w-32" />
        <Skeleton className="h-8 w-56 sm:h-9" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />

        <div className={cardClassName("mt-6 p-4 sm:p-6")}>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="h-5 w-40" />
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, fieldIndex) => (
                    <div key={fieldIndex}>
                      <Skeleton className="mb-2 h-4 w-24" />
                      <Skeleton className="h-11 w-full" rounded="control" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end border-t border-border pt-4">
              <Skeleton className="h-11 w-32" rounded="full" />
            </div>
          </div>
        </div>
      </SkeletonGroup>
    </Container>
  );
}
