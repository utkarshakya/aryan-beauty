import type { ReactNode } from "react";

type SkeletonProps = {
  className?: string;
  rounded?: "full" | "card" | "control" | "none";
};

const roundedClasses: Record<NonNullable<SkeletonProps["rounded"]>, string> =
  {
    full: "rounded-full",
    card: "rounded-card",
    control: "rounded-control",
    none: "",
  };

export function Skeleton({ className = "", rounded = "full" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-muted-soft ${roundedClasses[rounded]} ${className}`}
    />
  );
}

export function SkeletonGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div role="status">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
