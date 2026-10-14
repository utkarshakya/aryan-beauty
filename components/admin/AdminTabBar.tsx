"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "@/components/ui/Container";

type AdminTab = {
  href: string;
  label: string;
  /**
   * `/admin` must not match `/admin/services`, so a plain prefix test is wrong
   * here — the dashboard tab claims the dashboard and the appointment detail
   * route explicitly, and the rest claim their own subtree.
   */
  matches: (pathname: string) => boolean;
};

const TABS: AdminTab[] = [
  {
    href: "/admin",
    label: "Appointments",
    matches: (pathname) =>
      pathname === "/admin" || pathname.startsWith("/admin/appointments"),
  },
  {
    href: "/admin/services",
    label: "Services",
    matches: (pathname) => pathname.startsWith("/admin/services"),
  },
  {
    href: "/admin/staff",
    label: "Staff",
    matches: (pathname) => pathname.startsWith("/admin/staff"),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    matches: (pathname) => pathname.startsWith("/admin/settings"),
  },
];

function tabClass(active: boolean) {
  return `inline-flex min-h-[44px] items-center border-b-2 px-3 transition-colors focus-ring ${
    active
      ? "border-primary font-medium text-foreground"
      : "border-transparent text-muted hover:border-border hover:text-foreground"
  }`;
}

export default function AdminTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin sections"
      // Sits directly under the site header (h-14 / sm:h-16). Both are rem, so
      // they scale together with the reduced mobile root font size. z-30 keeps
      // it below the header's z-40, so an expanded mobile menu covers it.
      className="sticky top-14 z-30 border-b border-border bg-background sm:top-16"
    >
      <Container>
        {/* Scrolls rather than squashing at 320px. The padding leaves room for
            the 2px focus ring plus its 2px offset, which overflow would clip. */}
        <ul className="flex gap-1 overflow-x-auto whitespace-nowrap px-1 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const active = tab.matches(pathname);
            return (
              <li key={tab.href} className="shrink-0">
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-sm ${tabClass(active)}`}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </nav>
  );
}
