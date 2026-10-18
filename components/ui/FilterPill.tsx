export function filterPillClasses(active: boolean) {
  // text-body at every breakpoint: the 44px tap-target floor is fixed, so small
  // type inside it just reads as dead vertical padding on a phone.
  const base =
    "inline-flex min-h-[44px] items-center justify-center rounded-full border px-3.5 py-2 text-body font-medium transition-[color,background-color,border-color,transform] duration-fast ease-out active:scale-[0.98] focus-ring sm:px-4";
  return active
    ? `${base} border-primary/30 bg-primary-soft text-primary-strong`
    : `${base} border-transparent text-muted hover:bg-neutral-soft`;
}

/** Segment of a segmented control — the shared border is drawn by the parent. */
export function filterSegmentClasses(active: boolean) {
  return `flex min-h-[44px] flex-1 items-center justify-center px-4 text-body font-medium transition-[color,background-color,transform] duration-fast ease-out active:scale-[0.98] focus-ring sm:flex-none ${
    active ? "bg-primary-soft text-primary-strong" : "text-muted hover:bg-muted"
  }`;
}
