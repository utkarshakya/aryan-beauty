"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Container from "@/components/ui/Container";
import AccountButton from "./AccountButton";
import ThemeToggle from "./ThemeToggle";

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/services", label: "Services" },
  { href: "/appointments", label: "Appointments" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function desktopLinkClass(active: boolean) {
  return `inline-flex min-h-[44px] items-center rounded-full px-3.5 py-2 text-sm transition-colors focus-ring ${
    active
      ? "bg-primary-soft font-medium text-primary-strong"
      : "text-muted hover:bg-neutral-soft hover:text-foreground"
  }`;
}

function mobileLinkClass(active: boolean) {
  return `flex min-h-[44px] items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-ring ${
    active
      ? "bg-primary-soft text-primary-strong"
      : "text-foreground hover:bg-neutral-soft"
  }`;
}

export default function NavbarClient({
  canAccessAdmin,
}: {
  canAccessAdmin: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  const items: NavItem[] = canAccessAdmin
    ? [...NAV_ITEMS, { href: "/admin", label: "Admin" }]
    : NAV_ITEMS;

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    }
  }, [menuOpen]);

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-border bg-background">
      <Container>
        <div className="flex h-14 items-center justify-between sm:h-16">
          <div className="flex items-center gap-2">
            <button
              ref={toggleRef}
              type="button"
              aria-label={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-full text-muted transition-colors hover:bg-neutral-soft hover:text-foreground focus-ring sm:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6"
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
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    isActivePath(pathname, item.href) ? "page" : undefined
                  }
                  className={desktopLinkClass(isActivePath(pathname, item.href))}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <AccountButton />
          </div>
        </div>
        {menuOpen && (
          <nav
            id="mobile-menu"
            ref={menuRef}
            className="border-t border-border py-2 pb-safe sm:hidden"
            aria-label="Mobile navigation"
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  isActivePath(pathname, item.href) ? "page" : undefined
                }
                onClick={() => setMenuOpen(false)}
                className={mobileLinkClass(isActivePath(pathname, item.href))}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-1 border-t border-border pt-1">
              <ThemeToggle variant="menu" />
            </div>
          </nav>
        )}
      </Container>
    </header>
  );
}
