"use client";

import { useEffect } from "react";
import Container from "./components/ui/Container";
import { Button } from "./components/ui/Button";
import { business } from "@/lib/business";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container size="narrow" className="py-16 text-center sm:py-24">
      <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        We couldn&apos;t load this page. Please try again, or call us on{" "}
        {business.phoneDisplay} if the problem continues.
      </p>
      <div className="mt-8 flex justify-center">
        <Button onClick={() => retry()}>Try again</Button>
      </div>
    </Container>
  );
}
