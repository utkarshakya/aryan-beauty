"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
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
  const panelId = useId();

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
      <div id={panelId} className={`mt-3 ${open ? "block" : "max-sm:hidden"}`}>
        {children}
      </div>
    </div>
  );
}
