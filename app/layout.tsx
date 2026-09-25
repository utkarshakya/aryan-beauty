import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { fraunces } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Unknown Beauty — Beauty Parlour & Online Booking",
    template: "%s | Unknown Beauty",
  },
  description:
    "Book appointments for hair, skin, nail and beauty services at Unknown Beauty — no account needed.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${fraunces.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
