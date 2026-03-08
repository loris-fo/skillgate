import Link from "next/link";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-text-heading sm:text-5xl">
        Don&apos;t install blind
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-text-body">
        Trust-verify any Claude skill before it touches your codebase.
        AI-powered security analysis with plain-English reasoning, not just a
        score.
      </p>

      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/audit"
          className="inline-flex items-center rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-hover"
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
    </section>
  );
}
