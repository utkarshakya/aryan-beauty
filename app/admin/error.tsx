"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function AdminError({
  error,
  reset,
  retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
}) {
  useEffect(() => {
    console.error("[error:admin]", error);
  }, [error]);

  const handleRetry = retry || reset || (() => window.location.reload());

  return (
    <ErrorState
      error={error}
      onRetry={handleRetry}
      title="Admin section unavailable"
      body="We couldn't load this admin page. The navigation above still works — try again, or pick another section."
    />
  );
}
