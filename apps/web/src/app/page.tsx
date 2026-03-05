import { AuditForm } from "@/components/audit-form";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Skillgate
        </h1>
        <p className="mt-2 text-text-secondary">
          Trust-verify Claude skills before installing them
        </p>
      </header>

      <div className="rounded-xl bg-surface-1 border border-border p-6">
        <AuditForm />
      </div>
    </main>
  );
}
