import Link from "next/link";

export function HeroSection() {
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
            fontSize: "clamp(48px, 10vw, 120px)",
            lineHeight: 1.0,
            letterSpacing: "-2px",
          }}
        >
          Don&apos;t install blind
        </h1>

        <div className="mx-auto mt-4 max-w-3xl">
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
          <Link
            href="/report/cursor-rules-architect"
            className="inline-flex items-center rounded-lg border-2 border-[#9d7aff] px-8 py-4 font-semibold text-[#9d7aff] transition-colors hover:bg-[#9d7aff]/10"
          >
            View example report
          </Link>
        </div>
      </div>
    </section>
  );
}
