import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative mx-auto max-w-4xl overflow-hidden px-4 pb-16 pt-32 text-center">
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
          className="font-bold tracking-tight text-text-heading"
          style={{ fontSize: "clamp(48px, 10vw, 120px)", lineHeight: 1.05 }}
        >
          Don&apos;t install blind.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-text-body">
          Trust-verify any Claude skill before it touches your codebase.
          AI-powered security analysis with plain-English reasoning, not just a
          score.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/audit"
            className="inline-flex items-center rounded-full bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Audit a skill
          </Link>
          <Link
            href="/report/cursor-rules-architect"
            className="text-sm text-text-muted transition-colors hover:text-accent"
          >
            View example report &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
