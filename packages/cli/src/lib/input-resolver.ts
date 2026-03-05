import fs from "node:fs";
import path from "node:path";

export type ResolvedInput =
  | { type: "content"; content: string; name: string }
  | { type: "url"; url: string };

function isLocalPath(source: string): boolean {
  return (
    source.startsWith("./") ||
    source.startsWith("/") ||
    source.startsWith("..") ||
    fs.existsSync(source)
  );
}

export function resolveInput(source: string): ResolvedInput {
  if (isLocalPath(source)) {
    const content = fs.readFileSync(source, "utf-8");
    return { type: "content", content, name: path.basename(source) };
  }

  if (/^https?:\/\//i.test(source)) {
    return { type: "url", url: source };
  }

  return {
    type: "url",
    url: `https://skills.sh/registry/${source}/SKILL.md`,
  };
}
