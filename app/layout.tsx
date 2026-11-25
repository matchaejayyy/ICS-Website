import type { Metadata } from "next";
import { Anton, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

// fonts
const fontBody = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});
const fontHero = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-hero",
  display: "swap",
  fallback: ["Impact", "Haettenschweiler", "Arial Narrow Bold", "sans-serif"],
});
const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});

export const metadata: Metadata = {
  title: "Institute of Computer Science",
  description:
    "The student organization for everyone who codes, designs, tinkers, or is curious about how computers work.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fontBody.variable} ${fontHero.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
