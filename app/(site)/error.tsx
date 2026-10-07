"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function SiteError({
  error,
  reset,
  retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
}) {
  useEffect(() => {
    console.error("[error:site]", error);
  }, [error]);

  const handleRetry = retry || reset || (() => window.location.reload());

  return (
    <ErrorState
      error={error}
      onRetry={handleRetry}
      body="We couldn't load this page. Please try again in a moment."
    />
  );
}
