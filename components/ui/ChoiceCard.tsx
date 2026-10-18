import type { ReactNode } from "react";

const cardClasses =
  "flex min-h-[44px] cursor-pointer items-center gap-3 rounded-control border border-border bg-background p-3 text-left text-body text-foreground transition-[color,background-color,border-color,transform] duration-fast ease-out active:scale-[0.99] focus-within-ring has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:not(:checked)]:hover:bg-muted";

/**
 * One option in a single-choice group. The radio is real but visually hidden,
 * so the group keeps native semantics and arrow-key navigation while the whole
 * card is the hit area. Selection and focus are both expressed on the card via
 * `has-[]` variants, which keeps the label purely a function of input state.
 *
 * The `name` groups the radios for the browser only — it must not collide with
 * a field the surrounding form submits. Mirrored values belong in a hidden
 * input on the form (see architecture.md, "Multi-step Forms").
 */
export function ChoiceCard({
  name,
  value,
  checked,
  onChange,
  className = "",
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`${cardClasses}${className ? ` ${className}` : ""}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {children}
    </label>
  );
}
