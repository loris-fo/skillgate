"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_SLUGS } from "@/lib/mock-reports";

export function HeroSection() {
  const router = useRouter();

  function handleExampleClick() {
    const slug = MOCK_SLUGS[Math.floor(Math.random() * MOCK_SLUGS.length)];
    router.push(`/report/${slug}`);
  }

  return (
    <section className="relative mx-auto max-w-4xl overflow-hidden px-4 pb-6 pt-28 text-center">
      {/* Violet gradient orb */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(157, 122, 255, 0.20) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        aria-hidden="true"
      />

      {/* Content above orb */}
      <div className="relative z-10">
        <h1
          className="font-bold text-text-heading"
          style={{
            fontSize: "clamp(48px, 8vw, 96px)",
            lineHeight: 1.0,
            letterSpacing: "-2px",
          }}
        >
          Don&apos;t install blind
        </h1>

        <div className="mx-auto mt-4" style={{ maxWidth: "820px" }}>
          <p className="text-2xl text-[#b8b0c8]" style={{ lineHeight: 1.5 }}>
            Trust-verify any Claude skill before it touches your codebase.
          </p>
          <p className="text-2xl text-[#b8b0c8]" style={{ lineHeight: 1.5 }}>
            AI-powered security analysis with plain-English reasoning, not just
            a score.
          </p>
        </div>

        <div className="mt-8 flex flex-row items-center justify-center gap-4">
          <Link
            href="/audit"
            className="inline-flex items-center rounded-lg bg-[#7c5ccc] px-8 py-4 font-semibold text-white transition-colors hover:bg-[#6b4db8]"
          >
            Audit a skill
          </Link>
          <button
            onClick={handleExampleClick}
            className="inline-flex items-center rounded-lg border-2 border-[#9d7aff] px-8 py-4 font-semibold text-[#9d7aff] transition-colors hover:bg-[#9d7aff]/10"
          >
            View example report
          </button>
        </div>
      </div>
    </section>
  );
}
