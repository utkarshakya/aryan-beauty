import { Fraunces } from "next/font/google";

export const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  fallback: ["Georgia", "ui-serif", "serif"],
});
