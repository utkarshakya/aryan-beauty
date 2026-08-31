"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import Container from "./ui/Container";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useUser();

  const authControl = isLoaded ? (
    isSignedIn ? (
      <UserButton />
    ) : (
      <Link
        href="/sign-in"
        className="rounded-full px-4 py-2 text-muted transition-colors hover:bg-neutral-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Login
      </Link>
    )
  ) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Unknown <span className="text-primary">Beauty</span>
          </Link>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            {authControl}
          </div>
        </div>
      </Container>
    </header>
  );
}
