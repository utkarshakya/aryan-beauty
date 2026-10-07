import { cloneElement, isValidElement, useId } from "react";
import type { ReactElement, ReactNode } from "react";

const labelClasses = "mb-1.5 block text-sm font-medium text-foreground";
const hintClasses = "mt-1.5 text-sm text-muted";
const errorClasses = "mt-1.5 text-sm text-danger";

type ControlChildProps = {
  id?: string;
  invalid?: boolean;
  "aria-describedby"?: string;
  "aria-errormessage"?: string;
};

export function Field({
  label,
  hint,
  error,
  htmlFor,
  className = "",
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
  className?: string;
  children: ReactElement<ControlChildProps>;
}) {
  const generatedId = useId();
  const childProps = isValidElement(children) ? children.props : null;
  const id = childProps?.id ?? htmlFor ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        invalid: Boolean(error) || childProps?.invalid,
        "aria-describedby": error ? undefined : hint ? hintId : undefined,
        "aria-errormessage": error ? errorId : undefined,
      })
    : children;

  return (
    <div className={className}>
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      {control}
      {hint && (
        <p id={hintId} className={hintClasses}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={errorClasses} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
