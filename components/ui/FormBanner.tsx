import type { ReactNode } from "react";

export type FormBannerTone = "success" | "danger";

const toneClasses: Record<FormBannerTone, string> = {
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
};

export type FormBannerProps = {
  tone?: FormBannerTone;
  className?: string;
  onDismiss?: () => void;
  children: ReactNode;
};

export function FormBanner({
  tone = "success",
  className,
  onDismiss,
  children,
}: FormBannerProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`rounded-control px-4 py-3 text-sm ${toneClasses[tone]}${className ? ` ${className}` : ""}`}
    >
      {onDismiss ? (
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 flex-1">{children}</span>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss message"
            className="-my-2 -mr-2 flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full transition-colors hover:bg-neutral-soft focus-ring"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
