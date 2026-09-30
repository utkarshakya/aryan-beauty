import type { HTMLAttributes, ReactNode } from "react";

export const cardClasses =
  "rounded-card border border-border bg-background shadow-card";

export const cardLabelHeadingClass =
  "text-sm font-semibold uppercase tracking-wide text-muted";

type CommonProps = {
  className?: string;
  children?: ReactNode;
};

export type CardProps = CommonProps &
  Omit<HTMLAttributes<HTMLDivElement>, "className" | "children">;

export function cardClassName(className?: string) {
  return className ? `${cardClasses} ${className}` : cardClasses;
}

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div className={cardClassName(className)} {...rest}>
      {children}
    </div>
  );
}
