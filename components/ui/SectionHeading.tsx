import type { HTMLAttributes, ReactNode } from "react";

const sizeClasses = {
  md: "text-lg font-semibold text-foreground sm:text-xl",
  lg: "text-xl font-bold tracking-tight sm:text-3xl",
} as const;

const gapClasses = {
  md: "mb-3 sm:mb-4",
  lg: "mb-7 sm:mb-10",
} as const;

export type SectionHeadingSize = keyof typeof sizeClasses;

export type SectionHeadingProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "className" | "children" | "title"
> & {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  size?: SectionHeadingSize;
  className?: string;
};

export function SectionHeading({
  title,
  description,
  actions,
  size = "md",
  id,
  className,
  ...rest
}: SectionHeadingProps) {
  const heading = (
    <>
      <h2 id={id} className={sizeClasses[size]}>
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-muted sm:mt-2 sm:text-base">
          {description}
        </p>
      )}
    </>
  );

  const rootClasses = [
    actions ? "flex flex-wrap items-end justify-between gap-3" : "",
    gapClasses[size],
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (actions) {
    return (
      <div className={rootClasses} {...rest}>
        <div className="min-w-0">{heading}</div>
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      </div>
    );
  }

  return (
    <div className={rootClasses} {...rest}>
      {heading}
    </div>
  );
}
