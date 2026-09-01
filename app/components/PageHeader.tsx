import type { ReactNode } from "react";

export default function PageHeader({
  title,
  subtitle,
  align = "center",
}: {
  title: string;
  subtitle?: ReactNode;
  align?: "center" | "left";
}) {
  const alignment =
    align === "center" ? "text-center mx-auto max-w-2xl" : "text-left";
  return (
    <div className={`${alignment} mb-7 sm:mb-10`}>
      <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-sm text-muted sm:mt-3 sm:text-lg">{subtitle}</p>
      )}
    </div>
  );
}
