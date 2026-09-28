import type { HTMLAttributes, ReactNode } from "react";

export type BadgeTone =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  pending: "bg-warning-soft text-warning",
  confirmed: "bg-success-soft text-success",
  completed: "bg-primary-soft text-primary-strong",
  cancelled: "bg-neutral-soft text-neutral",
  neutral: "bg-neutral-soft text-neutral",
};

const baseClasses =
  "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium";

const tones = Object.keys(toneClasses) as BadgeTone[];

export function badgeTone(value: string): BadgeTone {
  return (tones as string[]).includes(value) ? (value as BadgeTone) : "neutral";
}

type CommonProps = {
  tone?: BadgeTone;
  className?: string;
  children?: ReactNode;
};

export type BadgeProps = CommonProps &
  Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children">;

export function badgeClassName(tone?: BadgeTone, className?: string) {
  const classes = `${baseClasses} ${toneClasses[tone ?? "neutral"]}`;
  return className ? `${classes} ${className}` : classes;
}

export function Badge({ tone, className, children, ...rest }: BadgeProps) {
  return (
    <span className={badgeClassName(tone, className)} {...rest}>
      {children}
    </span>
  );
}
