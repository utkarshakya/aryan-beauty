"use client";

// global-error must define its own <html> and <body> — it replaces the root
// layout when a root-layout failure occurs, so it re-applies the global styles,
// font variable, and theme init script itself.
import "./globals.css";
import { fraunces } from "./fonts";

const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export default function GlobalError({
  error,
  reset,
  retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
}) {
  const handleRetry =
    retry || reset || (() => window.location.reload());

  return (
    <html
      lang="en"
      className={`${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col items-center justify-center bg-background px-4 text-foreground">
        <title>Something went wrong</title>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <main className="w-full max-w-xl text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Something went wrong
          </h1>
          <p className="mx-auto mt-3 max-w-md text-muted">
            The application hit an unexpected error and couldn&apos;t recover.
            Please reload the page.
          </p>
          {process.env.NODE_ENV === "development" && error?.message && (
            <p className="mx-auto mt-4 max-w-md break-words rounded-control bg-danger-soft p-2 text-xs font-mono text-danger">
              {error.message}
            </p>
          )}
          {error?.digest && (
            <p className="mt-4 text-xs text-muted">Reference: {error.digest}</p>
          )}
          <button
            type="button"
            onClick={handleRetry}
            className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-primary-strong focus-ring"
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
