import type { Metadata } from "next";
import { AuditForm } from "@/components/audit-form";

export const metadata: Metadata = {
  title: "Audit a Skill — Skillgate",
  description:
    "Paste skill file content or provide a URL to audit any AI agent skill for security risks.",
};

export default function AuditPage() {
  return (
    <main
      className="flex-1 px-4"
      style={{ backgroundColor: "#1a1625" }}
    >
      {/* Hero */}
      <div
        className="text-center mx-auto"
        style={{ paddingTop: "120px", maxWidth: "900px" }}
      >
        <h1
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "white",
            lineHeight: 1.1,
            marginBottom: "24px",
          }}
        >
          Audit your AI skills with confidence.
        </h1>
        <p
          className="mx-auto"
          style={{
            fontSize: "20px",
            fontWeight: 400,
            color: "#b8b0c8",
            lineHeight: 1.6,
            maxWidth: "700px",
          }}
        >
          Paste your skill file content or provide a URL to get a full security
          audit with plain-English reasoning.
        </p>
      </div>

      {/* Form Card */}
      <div
        className="mx-auto"
        style={{
          maxWidth: "640px",
          marginTop: "48px",
          marginBottom: "64px",
          backgroundColor: "#2d2640",
          border: "1px solid #3d3650",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <AuditForm />
      </div>
    </main>
  );
}
