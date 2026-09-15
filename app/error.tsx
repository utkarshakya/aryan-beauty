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
      <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        We couldn&apos;t load this page. Please try again later.
      </p>
      {error?.message && (
        <p className="mt-4 text-xs font-mono text-red-500 bg-red-50 p-2 rounded max-w-md mx-auto wrap-break-word">
          {error.message}
        </p>
      )}
      <div className="mt-8 flex justify-center">
        <Button onClick={() => handleRetry()}>Try again</Button>
      </div>
    </Container>
  );
}
