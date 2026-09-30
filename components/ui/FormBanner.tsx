import type { ReactNode } from "react";

export type FormBannerTone = "success" | "danger";

const toneClasses: Record<FormBannerTone, string> = {
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
};

export type FormBannerProps = {
  tone?: FormBannerTone;
  className?: string;
  children: ReactNode;
};

export function FormBanner({
  tone = "success",
  className,
  children,
}: FormBannerProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`rounded-control px-4 py-3 text-sm ${toneClasses[tone]}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
