"use client";

import { useEffect, useRef, useState } from "react";

const mockCategories = [
  { name: "Hidden Logic", severity: "Safe", color: "var(--color-severity-safe)", progress: 95 },
  { name: "Data Access", severity: "Safe", color: "var(--color-severity-safe)", progress: 92 },
  { name: "Action Risk", severity: "Low", color: "var(--color-severity-low)", progress: 78 },
  { name: "Permission Scope", severity: "Safe", color: "var(--color-severity-safe)", progress: 90 },
  { name: "Override Attempts", severity: "Safe", color: "var(--color-severity-safe)", progress: 96 },
];

export function AnimatedMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 px-4">
      <h2 className="text-text-heading font-bold text-2xl mb-8 text-center">
        See it in action
      </h2>

      <div
        ref={containerRef}
        className="max-w-3xl mx-auto rounded-xl border border-border-card shadow-card overflow-hidden bg-surface-card"
      >
        {/* Browser chrome top bar */}
        <div className="bg-surface-2 px-4 py-3 flex items-center gap-2 border-b border-border-card">
          <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
          <span className="w-3 h-3 rounded-full bg-[#EAB308]" />
          <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
          <div className="bg-white rounded px-3 py-1 text-xs text-text-muted flex-1 ml-4">
            skillgate.sh/report/example-skill
          </div>
        </div>

        {/* Mock report content */}
        <div className="p-6">
          {/* Verdict banner */}
          <div
            className="rounded-lg p-4 font-semibold text-center mb-6 border transition-all duration-500 ease-out"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-severity-safe) 10%, transparent)",
              color: "var(--color-severity-safe)",
              borderColor: "color-mix(in srgb, var(--color-severity-safe) 20%, transparent)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
            }}
          >
            Safe to Install
          </div>

          {/* Category rows */}
          {mockCategories.map((cat, i) => (
            <div
              key={cat.name}
              className="flex items-center justify-between p-4 border-b border-border-card last:border-b-0 transition-all duration-500 ease-out"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(16px)",
                transitionDelay: `${(i + 1) * 150}ms`,
              }}
            >
              <span className="text-text-body font-medium">{cat.name}</span>
              <div className="flex items-center gap-3">
                <span
                  className="text-sm font-semibold"
                  style={{ color: cat.color }}
                >
                  {cat.severity}
                </span>
                <div className="w-24 h-2 rounded-full bg-surface-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: visible ? `${cat.progress}%` : "0%",
                      backgroundColor: cat.color,
                      transitionDelay: `${(i + 1) * 150 + 200}ms`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
