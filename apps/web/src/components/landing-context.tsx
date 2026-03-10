"use client";

import { createContext, useContext } from "react";

const LandingContext = createContext(false);

export function LandingProvider({
  value,
  children,
}: {
  value: boolean;
  children: React.ReactNode;
}) {
  return (
    <LandingContext.Provider value={value}>{children}</LandingContext.Provider>
  );
}

export function useLandingMode() {
  return useContext(LandingContext);
}
