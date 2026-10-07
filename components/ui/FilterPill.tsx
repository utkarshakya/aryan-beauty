export function filterPillClasses(active: boolean) {
  const base =
    "inline-flex min-h-[44px] items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-ring sm:px-4 sm:py-2 sm:text-sm";
  return active
    ? `${base} border-primary/30 bg-primary-soft text-primary-strong`
    : `${base} border-transparent text-muted hover:bg-neutral-soft`;
}
