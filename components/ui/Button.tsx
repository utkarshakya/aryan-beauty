import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

const baseClasses =
  "inline-flex min-h-[44px] items-center justify-center rounded-full font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-fast ease-out active:scale-[0.98] focus-ring disabled:pointer-events-none disabled:opacity-60";

const sizeClasses = {
  md: "px-4 py-2.5 text-meta sm:px-5 sm:text-body",
  lg: "px-6 py-3 text-body sm:px-7 sm:text-body-lg",
} as const;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-background hover:bg-primary-strong",
  secondary:
    "bg-primary-soft text-primary hover:bg-primary-strong hover:text-background",
  outline:
    "border border-border bg-background text-foreground shadow-sm hover:border-primary hover:bg-neutral-soft",
  ghost: "text-foreground hover:bg-neutral-soft",
  danger: "bg-danger text-background hover:bg-danger/95",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: keyof typeof sizeClasses;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonLinkProps = CommonProps & { href: string };

function classesFor({
  variant,
  size,
  className,
}: Omit<CommonProps, "children">) {
  return `${baseClasses} ${sizeClasses[size ?? "md"]} ${variantClasses[variant ?? "primary"]}${className ? ` ${className}` : ""}`;
}

export function Button({ variant, size, className, children, ...rest }: ButtonProps) {
  return (
    <button className={classesFor({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, className, children, href }: ButtonLinkProps) {
  return (
    <Link href={href} className={classesFor({ variant, size, className })}>
      {children}
    </Link>
  );
}
