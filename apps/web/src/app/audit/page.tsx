import type { Metadata } from "next";
import { AuditForm } from "@/components/audit-form";

export const metadata: Metadata = {
  title: "Audit a Skill — Skillgate",
  description:
    "Paste a SKILL.md or provide a URL to audit any Claude skill for security risks.",
};

export default function AuditPage() {
  return (
    <section className="max-w-2xl mx-auto py-12 px-4 animate-fade-in">
      <div className="rounded-xl bg-surface-card border border-border-card shadow-card p-8">
        <h1 className="text-2xl font-bold text-text-heading mb-2">
          Audit a Skill
        </h1>
        <p className="text-text-body mb-6">
          Paste your SKILL.md content or provide a URL to get a full security
          audit with plain-English reasoning.
        </p>
        <AuditForm />
      </div>
    </section>
  );
}
