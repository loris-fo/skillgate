"use client";

import { usePathname } from "next/navigation";

export function LayoutBody({
  fontClassName,
  children,
}: {
  fontClassName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <body
      className={`${fontClassName} text-text-primary font-sans antialiased min-h-screen flex flex-col${isLanding ? " dark-landing" : ""}`}
    >
      {children}
    </body>
  );
}
