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
          <div className="rounded-xl bg-[#2d2640] p-8 shadow-lg flex flex-col items-center gap-4">
            <div className="h-10 w-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <p className="text-white text-lg font-medium">
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
          className="block"
          style={{ fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}
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
          onFocus={(e) => { e.target.style.borderColor = "#9d7aff"; }}
          onBlur={(e) => { e.target.style.borderColor = "#3d3650"; }}
          placeholder="https://github.com/user/repo/raw/.../skill-file.md"
          className="w-full rounded-lg px-4 text-white placeholder:text-[#8a8196] focus:outline-none transition-colors"
          style={{ height: "48px", backgroundColor: "#1a1625", border: "1px solid #3d3650", ...(loading ? { opacity: 0.6 } : {}) }}
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#3d3650]" />
        <span className="text-[#9d7aff] text-sm">or paste content</span>
        <div className="h-px flex-1 bg-[#3d3650]" />
      </div>

      {/* Textarea */}
      <div>
        <label
          htmlFor="skill-content"
          className="block"
          style={{ fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}
        >
          Skill file content
        </label>
        <textarea
          id="skill-content"
          value={content}
          disabled={loading}
          onChange={(e) => {
            setContent(e.target.value);
            clearError();
          }}
          onFocus={(e) => { e.target.style.borderColor = "#9d7aff"; }}
          onBlur={(e) => { e.target.style.borderColor = "#3d3650"; }}
          placeholder="Paste skill file content here..."
          rows={12}
          className="w-full rounded-lg px-4 py-4 text-white placeholder:text-[#8a8196] font-mono text-sm leading-relaxed resize-y focus:outline-none transition-colors"
          style={{ height: "120px", backgroundColor: "#1a1625", border: "1px solid #3d3650", ...(loading ? { opacity: 0.6 } : {}) }}
        />
        <p className="mt-1 text-right text-sm text-[#8a8196]">
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
        className="w-full rounded-lg text-white font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ height: "52px", marginTop: "24px", backgroundColor: "#7c5ccc", fontSize: "16px", fontWeight: 600 }}
        onMouseEnter={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.backgroundColor = "#8d6ddd";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(157,122,255,0.3)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#7c5ccc";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        Audit Skill
      </button>
    </form>
    </>
  );
}
