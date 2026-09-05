"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import Container from "@/components/ui/Container";
import ThemeToggle from "./ThemeToggle";

export default function NavbarClient({ canAccessAdmin }: { canAccessAdmin: boolean }) {
  const { isSignedIn, isLoaded } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <Container>
        <div className="flex h-14 items-center justify-between sm:h-16">
          <Link href="/" className="text-lg font-bold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-xl">Unknown <span className="text-primary">Beauty</span></Link>
          <div className="flex items-center gap-1">
            <nav className="hidden items-center gap-1 sm:flex" aria-label="Main navigation">
              <Link href="/services" className="rounded-full px-3 py-2 text-sm text-muted transition-colors hover:bg-neutral-soft hover:text-foreground">Services</Link>
              <Link href="/appointments" className="rounded-full px-3 py-2 text-sm text-muted transition-colors hover:bg-neutral-soft hover:text-foreground">Appointments</Link>
              {canAccessAdmin && <Link href="/admin" className="rounded-full px-3 py-2 text-sm text-muted transition-colors hover:bg-neutral-soft hover:text-foreground">Admin</Link>}
            </nav>
            <ThemeToggle />
            <div className="hidden sm:block">{isLoaded ? (isSignedIn ? <UserButton /> : <Link href="/sign-in" className="rounded-full px-3 py-2 text-sm text-muted transition-colors hover:bg-neutral-soft hover:text-foreground sm:px-4">Login</Link>) : null}</div>
            <button type="button" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="rounded-full p-1.5 text-muted transition-colors hover:bg-neutral-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:hidden">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-border py-2 sm:hidden" aria-label="Mobile navigation">
            <Link href="/" onClick={closeMenu} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-neutral-soft">Home</Link>
            <Link href="/services" onClick={closeMenu} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-neutral-soft">Services</Link>
            <Link href="/appointments" onClick={closeMenu} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-neutral-soft">Appointments</Link>
            {canAccessAdmin && <Link href="/admin" onClick={closeMenu} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-neutral-soft">Admin</Link>}
            {isLoaded && <div className="border-t border-border pt-1">{isSignedIn ? <UserButton /> : <Link href="/sign-in" onClick={closeMenu} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-neutral-soft">Login</Link>}</div>}
          </nav>
        )}
      </Container>
    </header>
  );
}
