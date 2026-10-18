"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import type { FormEvent, MouseEvent, ReactNode } from "react";
import { Button } from "@/components/ui";

/**
 * Collapses the dashboard's filter controls on small screens.
 *
 * Every filter is a link or a GET form driving the URL, so the panel only owns
 * the open/closed state — the values themselves stay server-rendered and
 * survive navigation, reload and back-button for free.
 */
export default function AdminFilters({
  children,
  activeCount = 0,
}: {
  children: ReactNode;
  activeCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const panelId = useId();

  function navigate(href: string) {
    startTransition(() => router.push(href));
  }

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const target = (event.target as HTMLElement).closest<HTMLAnchorElement>(
      'a[href^="/admin"]',
    );
    if (!target || event.defaultPrevented || event.button !== 0) return;
    event.preventDefault();
    navigate(target.href.replace(window.location.origin, ""));
  }

  function handleSubmit(event: FormEvent<HTMLDivElement>) {
    const form = (event.target as HTMLElement).closest("form");
    if (!form || form.method.toLowerCase() !== "get") return;
    event.preventDefault();
    const params = new URLSearchParams();
    new FormData(form).forEach((value, key) => {
      if (typeof value === "string" && value) params.set(key, value);
    });
    const query = params.toString();
    const action = new URL(form.action || "/admin", window.location.href);
    action.pathname = "/admin";
    action.search = query ? `?${query}` : "";
    navigate(`${action.pathname}${action.search}`);
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="w-full sm:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Hide filters" : "Filters"}
        {activeCount > 0 && (
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-meta font-medium text-primary-strong">
            {activeCount}
          </span>
        )}
      </Button>

      {/* Collapsed state uses `max-sm:hidden` rather than the `hidden`
          attribute: Tailwind's preflight sets `[hidden] {display:none!important}`,
          which no `sm:block` can override. Keeping the two states on mutually
          exclusive classes means the panel is closed on phones and permanently
          open from 640px up, with no reliance on stylesheet order. */}
      <div
        id={panelId}
        className={`relative mt-3 ${open ? "block" : "max-sm:hidden"}`}
        aria-busy={pending}
        onClick={handleClick}
        onSubmit={handleSubmit}
      >
        {pending && (
          <div
            className="absolute inset-0 z-10 rounded-card bg-background/60 backdrop-blur-[1px]"
            role="status"
            aria-label="Updating appointment filters"
          >
            <div className="sticky top-2 mx-auto h-1 w-24 animate-pulse rounded-full bg-primary" />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
