import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LayoutBody } from "@/components/layout-body";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Skillgate",
  description: "Trust-verify AI agent skills before installing them",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${geistMono.variable}`}>
      <LayoutBody fontClassName={`${plusJakartaSans.variable} ${geistMono.variable}`}>
        <Header />
        <main className="flex-1 bg-bg-page">
          {children}
        </main>
        <Footer />
      </LayoutBody>
    </html>
  );
}
