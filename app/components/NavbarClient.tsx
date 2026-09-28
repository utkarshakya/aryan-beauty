"use client";

import Link from "next/link";
import { useState } from "react";
import Container from "@/components/ui/Container";
import AccountButton from "./AccountButton";
import ThemeToggle from "./ThemeToggle";

export default function NavbarClient({
  canAccessAdmin,
}: {
  canAccessAdmin: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <Container>
        <div className="flex h-14 items-center justify-between sm:h-16">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-full p-1.5 text-muted transition-colors hover:bg-neutral-soft hover:text-foreground focus-ring sm:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                {menuOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-foreground focus-ring sm:text-xl"
            >
              Unknown <span className="text-primary">Beauty</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <nav
              className="hidden items-center gap-1 sm:flex"
              aria-label="Main navigation"
            >
              <Link
                href="/services"
                className="rounded-full px-3 py-2 text-sm text-muted transition-colors hover:bg-neutral-soft hover:text-foreground"
              >
                Services
              </Link>
              <Link
                href="/appointments"
                className="rounded-full px-3 py-2 text-sm text-muted transition-colors hover:bg-neutral-soft hover:text-foreground"
              >
                Appointments
              </Link>
              {canAccessAdmin && (
                <Link
                  href="/admin"
                  className="rounded-full px-3 py-2 text-sm text-muted transition-colors hover:bg-neutral-soft hover:text-foreground"
                >
                  Admin
                </Link>
              )}
            </nav>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <AccountButton />
          </div>
        </div>
        {menuOpen && (
          <nav
            className="border-t border-border py-2 sm:hidden"
            aria-label="Mobile navigation"
          >
            <Link
              href="/services"
              onClick={closeMenu}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-neutral-soft"
            >
              Services
            </Link>
            <Link
              href="/appointments"
              onClick={closeMenu}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-neutral-soft"
            >
              Appointments
            </Link>
            {canAccessAdmin && (
              <Link
                href="/admin"
                onClick={closeMenu}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-neutral-soft"
              >
                Admin
              </Link>
            )}
            <div className="mt-1 border-t border-border pt-1">
              <ThemeToggle variant="menu" />
            </div>
          </nav>
        )}
      </Container>
    </header>
  );
}
