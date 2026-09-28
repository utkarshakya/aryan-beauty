import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const controlClasses =
  "w-full rounded-control border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/70 transition-colors focus-ring sm:px-4 sm:py-2.5";
const invalidClasses = "border-danger bg-danger-soft";

type ControlProps = {
  className?: string;
  invalid?: boolean;
};

function classNames(className?: string, invalid?: boolean) {
  return `${controlClasses}${invalid ? ` ${invalidClasses}` : ""}${className ? ` ${className}` : ""}`;
}

export function Input({
  className,
  invalid,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & ControlProps) {
  return (
    <input
      {...rest}
      aria-invalid={invalid || rest["aria-invalid"]}
      className={classNames(className, invalid)}
    />
  );
}

export function Textarea({
  className,
  invalid,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & ControlProps) {
  return (
    <textarea
      {...rest}
      aria-invalid={invalid || rest["aria-invalid"]}
      className={classNames(className, invalid)}
    />
  );
}

export function Select({
  className,
  invalid,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & ControlProps) {
  return (
    <select
      {...rest}
      aria-invalid={invalid || rest["aria-invalid"]}
      className={classNames(className, invalid)}
    />
  );
}
