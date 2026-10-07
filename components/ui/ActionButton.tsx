import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ActionButtonTone = "primary" | "success" | "danger";

const toneClasses: Record<ActionButtonTone, string> = {
  primary: "text-primary hover:text-primary-strong",
  success: "text-success hover:text-success/80",
  danger: "text-danger hover:text-danger/80",
};

const baseClasses =
  "inline-flex min-h-[44px] items-center px-1 py-1 text-sm font-medium underline transition-colors focus-ring disabled:pointer-events-none disabled:opacity-60";

export type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ActionButtonTone;
  className?: string;
  children: ReactNode;
};

export function actionButtonClasses(
  tone?: ActionButtonTone,
  className?: string,
) {
  const classes = `${baseClasses} ${toneClasses[tone ?? "danger"]}`;
  return className ? `${classes} ${className}` : classes;
}

export function ActionButton({
  tone,
  className,
  children,
  ...rest
}: ActionButtonProps) {
  return (
    <button className={actionButtonClasses(tone, className)} {...rest}>
      {children}
    </button>
  );
}
