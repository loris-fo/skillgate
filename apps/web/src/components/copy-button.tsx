"use client";

import { useState } from "react";

export function CopyButton({
  text,
  label,
  className,
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`bg-surface-3 hover:bg-accent-muted text-text-secondary border border-border rounded px-3 py-1.5 text-sm transition ${className ?? ""}`}
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
