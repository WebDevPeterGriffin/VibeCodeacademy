import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";
import AskGeorgeFAB from "@/components/AskGeorgeFAB";

const displayFont = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VibeCode Bible Academy — Stop Renting. Start Owning.",
  description:
    "A structured learning platform for vibe coding. Learn to build with AI as your creative partner.",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${displayFont.variable} ${bodyFont.variable}`}>
      <body className="noise-overlay min-h-screen bg-dark text-gray-200 antialiased">
        {children}
        <AskGeorgeFAB />
      </body>
    </html>
  );
}
