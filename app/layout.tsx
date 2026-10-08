import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/ui/Toast";
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

export const viewport: Viewport = {
  viewportFit: "cover",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${fraunces.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col">
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
          <ToastProvider>{children}</ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
