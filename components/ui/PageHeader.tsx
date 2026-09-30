import Link from "next/link";
import type { ReactNode } from "react";

export type PageHeaderProps = {
  title: string;
  subtitle?: ReactNode;
  eyebrow?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  backHref,
  backLabel = "Back",
  actions,
  align = "left",
  className,
}: PageHeaderProps) {
  const wrapperClasses = [
    "mb-7 sm:mb-10",
    align === "center" ? "mx-auto max-w-2xl text-center" : "text-left",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {backHref && (
        <Link
          href={backHref}
          className="mb-2 inline-block text-sm font-medium text-primary hover:text-primary-strong focus-ring"
        >
          ← {backLabel}
        </Link>
      )}
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          {eyebrow}
        </p>
      )}
      <h1
        className={`text-2xl font-bold tracking-tight text-foreground sm:text-3xl${
          eyebrow || backHref ? " mt-1" : ""
        }`}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm text-muted sm:text-base">{subtitle}</p>
      )}
    </>
  );

  if (actions) {
    return (
      <header
        className={`flex flex-wrap items-start justify-between gap-4 ${wrapperClasses}`}
      >
        <div className="min-w-0">{content}</div>
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      </header>
    );
  }

  return <header className={wrapperClasses}>{content}</header>;
}
