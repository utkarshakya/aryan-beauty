import type { HTMLAttributes, ReactNode } from "react";

export const emptyStateClasses =
  "rounded-card border border-dashed border-border p-5 text-center sm:p-8";

type CommonProps = {
  className?: string;
  children?: ReactNode;
};

export type EmptyStateProps = CommonProps &
  Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "title"> & {
    title: ReactNode;
    body?: ReactNode;
    icon?: ReactNode;
    actions?: ReactNode;
  };

export function emptyStateClassName(className?: string) {
  return className ? `${emptyStateClasses} ${className}` : emptyStateClasses;
}

export function EmptyState({
  title,
  body,
  icon,
  actions,
  className,
  children,
  ...rest
}: EmptyStateProps) {
  return (
    <div className={emptyStateClassName(className)} {...rest}>
      {icon && (
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted-soft text-muted">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {body && <div className="mt-1 text-sm text-muted">{body}</div>}
      {actions && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
