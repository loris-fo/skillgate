"use client";

import { usePathname } from "next/navigation";
import { LandingProvider } from "@/components/landing-context";

export function LayoutBody({
  fontClassName,
  children,
}: {
  fontClassName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDark = pathname === "/" || pathname === "/audit" || pathname.startsWith("/report");

  return (
    <body
      className={`${fontClassName} text-text-primary font-sans antialiased min-h-screen flex flex-col${isDark ? " dark-landing" : ""}`}
    >
      <LandingProvider value={isDark}>{children}</LandingProvider>
    </body>
  );
}
