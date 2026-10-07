"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function AccountButton() {
  const { isLoaded, isSignedIn, user } = useUser();
  const clerk = useClerk();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        const items = Array.from(
          menuRef.current?.querySelectorAll<HTMLButtonElement>(
            '[role="menuitem"]',
          ) ?? [],
        );
        if (items.length === 0) return;
        const currentIndex = items.indexOf(
          document.activeElement as HTMLButtonElement,
        );
        event.preventDefault();
        const nextIndex =
          event.key === "ArrowDown"
            ? (currentIndex + 1) % items.length
            : currentIndex <= 0
              ? items.length - 1
              : currentIndex - 1;
        items[nextIndex]?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      menuRef.current?.querySelector("button")?.focus();
    }
  }, [open]);

  if (!isLoaded) return null;

  if (!isSignedIn || !user) {
    return (
      <div className="flex h-full items-center">
        <Link
          href="/sign-in"
          className="inline-flex min-h-[44px] items-center rounded-full px-3 py-2 text-sm text-muted transition-colors hover:bg-neutral-soft hover:text-foreground focus-ring sm:px-4"
        >
          Login
        </Link>
      </div>
    );
  }

  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((part) => part!.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div
      ref={containerRef}
      className="relative flex h-full items-center"
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={user.fullName ? `Account menu for ${user.fullName}` : "Account menu"}
        onClick={() => setOpen((value) => !value)}
        className="flex h-[44px] w-[44px] items-center justify-center rounded-full transition-colors hover:bg-neutral-soft focus-ring"
      >
        {user.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Clerk avatar URLs come from arbitrary OAuth hosts
          <img
            src={user.imageUrl}
            alt=""
            className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary-strong ring-1 ring-border">
            {initials || "U"}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full z-50 mt-2 w-44 rounded-card border border-border bg-background p-1.5 shadow-card"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              clerk.openUserProfile();
            }}
            className="flex min-h-[44px] w-full items-center rounded-control px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-neutral-soft focus-ring"
          >
            Manage account
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void clerk.signOut();
            }}
            className="flex min-h-[44px] w-full items-center rounded-control px-3 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-danger-soft focus-ring"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
