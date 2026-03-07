import { AuditForm } from "@/components/audit-form";

export default function Home() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text-heading">
          Trust-verify Claude skills
        </h1>
        <p className="mt-2 text-text-body">
          Paste a skill URL to get a detailed security audit
        </p>
      </div>

      <div className="rounded-xl bg-surface-1 border border-border p-6">
        <AuditForm />
      </div>
    </section>
  );
}
