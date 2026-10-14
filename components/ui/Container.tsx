import type { ReactNode } from "react";

const widthClasses = {
  default: "max-w-6xl",
  wide: "max-w-4xl",
  narrow: "max-w-xl",
} as const;

export default function Container({
  size = "default",
  className = "",
  children,
}: {
  size?: keyof typeof widthClasses;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`mx-auto w-full ${widthClasses[size]} px-3 sm:px-4${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
