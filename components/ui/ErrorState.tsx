"use client";

import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export type ErrorStateProps = {
  error: Error & { digest?: string };
  onRetry?: () => void;
  title?: string;
  body?: string;
  className?: string;
};

export function ErrorState({
  error,
  onRetry,
  title = "Something went wrong",
  body = "We couldn't load this page. Please try again later.",
  className = "",
}: ErrorStateProps) {
  return (
    <Container size="narrow" className={`py-16 text-center sm:py-24${className ? ` ${className}` : ""}`}>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted">{body}</p>
      {process.env.NODE_ENV === "development" && error?.message && (
        <p className="mx-auto mt-4 max-w-md break-words rounded-control bg-danger-soft p-2 text-xs font-mono text-danger">
          {error.message}
        </p>
      )}
      {error?.digest && (
        <p className="mt-4 text-xs text-muted">Reference: {error.digest}</p>
      )}
      {onRetry && (
        <div className="mt-8 flex justify-center">
          <Button onClick={onRetry}>Try again</Button>
        </div>
      )}
    </Container>
  );
}
