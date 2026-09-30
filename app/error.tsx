"use client";

import { useEffect } from "react";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
  retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled Application Error:", error);
  }, [error]);

  const handleRetry = reset || retry || (() => window.location.reload());

  return (
    <Container size="narrow" className="py-16 text-center sm:py-24">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        We couldn&apos;t load this page. Please try again later.
      </p>
      {error?.message && (
        <p className="mx-auto mt-4 max-w-md break-words rounded-control bg-danger-soft p-2 text-xs font-mono text-danger">
          {error.message}
        </p>
      )}
      <div className="mt-8 flex justify-center">
        <Button onClick={() => handleRetry()}>Try again</Button>
      </div>
    </Container>
  );
}
