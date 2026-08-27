"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Container from "./ui/Container";
import { ButtonLink } from "./ui/Button";

const navLinks = [{ name: "Services", href: "/services" }];

function NavLink({ name, href }: { name: string; href: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-4 py-2 transition-colors hover:bg-primary-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        active ? "font-medium text-primary" : "text-foreground"
      }`}
    >
      {name}
    </Link>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Aryan <span className="text-primary">Beauty</span>
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
            <Link
              href="/sign-in"
              className="rounded-full px-4 py-2 text-muted transition-colors hover:bg-neutral-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Owner Login
            </Link>
            <ButtonLink href="/book" className="ml-2">
              Book Now
            </ButtonLink>
          </nav>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-2 text-foreground transition-colors hover:bg-neutral-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </Container>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-border md:hidden">
          <nav aria-label="Mobile navigation">
            <Container className="space-y-1 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className="block rounded-lg px-4 py-3 text-foreground transition-colors hover:bg-primary-soft hover:text-primary"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/sign-in"
                onClick={closeMenu}
                className="block rounded-lg px-4 py-3 text-sm text-muted transition-colors hover:text-foreground"
              >
                Owner Login
              </Link>
            </Container>
          </nav>
        </div>
      )}
    </header>
  );
}
