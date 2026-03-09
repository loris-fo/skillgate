"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AuditResponse, ErrorResponse } from "@/lib/types";

export function AuditForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasContent = content.trim().length > 0;
  const hasUrl = url.trim().length > 0;
  const canSubmit = (hasContent || hasUrl) && !loading;

  function clearError() {
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Client-side URL validation
    if (hasUrl && !hasContent) {
      try {
        new URL(url.trim());
      } catch {
        setError("Invalid URL format");
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const body = hasContent
        ? { content: content.trim() }
        : { url: url.trim() };

      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: AuditResponse | ErrorResponse = await res.json();

      if ("error" in data) {
        setError(data.error.message);
        setLoading(false);
        return;
      }

      router.push(`/report/${data.meta.slug}`);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="rounded-xl bg-white p-8 shadow-lg flex flex-col items-center gap-4">
            <div className="h-10 w-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <p className="text-text-heading text-lg font-medium">
              Auditing skill...
            </p>
            <p className="text-text-body text-sm">
              This usually takes a few seconds
            </p>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
      {/* URL Input */}
      <div>
        <label
          htmlFor="skill-url"
          className="block text-sm font-medium text-text-secondary mb-1.5"
        >
          Skill URL
        </label>
        <input
          id="skill-url"
          type="url"
          value={url}
          disabled={loading}
          onChange={(e) => {
            setUrl(e.target.value);
            clearError();
          }}
          placeholder="https://github.com/user/repo/raw/.../SKILL.md"
          className={`w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors${loading ? " opacity-60" : ""}`}
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-text-muted text-sm">or paste content</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Textarea */}
      <div>
        <label
          htmlFor="skill-content"
          className="block text-sm font-medium text-text-secondary mb-1.5"
        >
          SKILL.md Content
        </label>
        <textarea
          id="skill-content"
          value={content}
          disabled={loading}
          onChange={(e) => {
            setContent(e.target.value);
            clearError();
          }}
          placeholder="Paste SKILL.md content here..."
          rows={12}
          className={`w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-text-primary placeholder:text-text-muted font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors${loading ? " opacity-60" : ""}`}
        />
        <p className="mt-1 text-right text-xs text-text-muted">
          {content.length.toLocaleString()} characters
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-severity-high/10 border border-severity-high/20 px-4 py-3 text-severity-high text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-lg bg-accent px-6 py-3 text-white font-medium transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Audit Skill
      </button>
    </form>
    </>
  );
}
