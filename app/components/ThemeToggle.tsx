"use client";

import { useEffect, useSyncExternalStore } from "react";

const getTheme = () =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("dark");

const subscribeToTheme = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  window.addEventListener("themechange", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("themechange", onChange);
  };
};

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribeToTheme, getTheme, () => false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const shouldUseDark =
      savedTheme === "dark" ||
      (savedTheme !== "light" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  function toggleTheme() {
    const nextIsDark = !isDark;
    document.documentElement.classList.toggle("dark", nextIsDark);
    window.localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    window.dispatchEvent(new Event("themechange"));
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-full p-1.5 text-muted transition-colors hover:bg-neutral-soft hover:text-foreground focus-ring sm:p-2"
    >
      {isDark ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z" />
        </svg>
      )}
    </button>
  );
}
