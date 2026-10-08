"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

export type ToastTone = "success" | "danger";

type ToastItem = {
  id: number;
  tone: ToastTone;
  message: string;
};

export type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const MAX_VISIBLE_TOASTS = 3;
const AUTO_DISMISS_MS = 5000;

const toneClasses: Record<ToastTone, string> = {
  success: "border-success/30 bg-success-soft text-success",
  danger: "border-danger/30 bg-danger-soft text-danger",
};

function ToneIcon({ tone }: { tone: ToastTone }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      {tone === "success" ? (
        <path d="M20 6 9 17l-5-5" />
      ) : (
        <path d="M18 6 6 18M6 6l12 12" />
      )}
    </svg>
  );
}

export function useToast(): ToastApi {
  const toast = useContext(ToastContext);
  if (!toast) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return toast;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const show = useCallback((tone: ToastTone, message: string) => {
    const id = ++nextIdRef.current;
    setToasts((prev) =>
      [...prev, { id, tone, message }].slice(-MAX_VISIBLE_TOASTS),
    );
    timersRef.current.set(
      id,
      setTimeout(() => {
        timersRef.current.delete(id);
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, AUTO_DISMISS_MS),
    );
  }, []);

  const dismiss = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) clearTimeout(timer);
    timersRef.current.delete(id);
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => show("success", message),
      error: (message) => show("danger", message),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end"
        style={{
          paddingBottom:
            "calc(1rem + env(safe-area-inset-bottom, 0px) + var(--toast-inset-bottom, 0px))",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "danger" ? "alert" : "status"}
            className={`toast-item pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-control border px-4 py-3 text-sm shadow-card ${toneClasses[toast.tone]}`}
          >
            <ToneIcon tone={toast.tone} />
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
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
        ))}
      </div>
    </ToastContext.Provider>
  );
}
