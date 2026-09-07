import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const baseClasses =
  "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

const sizeClasses = {
  md: "px-4 py-2.5 text-xs sm:px-5 sm:text-sm",
  lg: "px-6 py-3 text-sm sm:px-7 sm:text-base",
} as const;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-strong",
  secondary: "bg-primary-soft text-primary hover:bg-primary-soft-strong",
  ghost: "text-foreground hover:bg-neutral-soft",
  danger: "bg-danger text-white hover:bg-danger/90",
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
