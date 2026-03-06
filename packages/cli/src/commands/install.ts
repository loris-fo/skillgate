import fs from "node:fs";
import { resolveInput } from "../lib/input-resolver.js";
import { auditViaApi } from "../lib/api-client.js";
import { isBlocked } from "../lib/gating.js";
import { createOutputHandler } from "../lib/output.js";

interface InstallOptions {
  output: string;
  force: boolean;
  json: boolean;
}

/**
 * Extract a filesystem-safe name from SKILL.md content.
 * Uses the first H1 heading, sanitized to lowercase kebab-case.
 * Falls back to "skill" if no heading found.
 */
function extractSkillName(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  if (!match) return "skill";

  return match[1]
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Fetch content from a URL.
 * For URL inputs, we need the raw content both for auditing and saving.
 */
async function fetchContent(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

export async function installCommand(
  source: string,
  options: InstallOptions,
): Promise<void> {
  const output = createOutputHandler(options.json);
  const spinner = output.startSpinner("Auditing skill...");
  const stages = [
    { delay: 2000, text: "Analyzing security patterns..." },
    { delay: 4000, text: "Generating report..." },
  ];
  const timers = stages.map(({ delay, text }) =>
    setTimeout(() => { if (spinner.isSpinning) spinner.text = text; }, delay)
  );

  try {
    const resolved = resolveInput(source);

    // For URL inputs, fetch content first so we have it for both audit and saving
    let content: string;
    if (resolved.type === "content") {
      content = resolved.content;
    } else {
      content = await fetchContent(resolved.url);
    }

    // Always audit with content (we fetched it for URL inputs)
    const response = await auditViaApi({ content });

    timers.forEach(clearTimeout);
    spinner.succeed("Audit complete");
    output.printResult(response);

    // Check gating
    if (isBlocked(response.result.overall_score) && !options.force) {
      console.error("Use --force to override.");
      process.exit(1);
      return;
    }

    // Extract skill name and write file
    const skillName = extractSkillName(content);
    const filename = `${skillName}.md`;
    const filepath = `${options.output}/${filename}`;

    fs.mkdirSync(options.output, { recursive: true });
    fs.writeFileSync(filepath, content, "utf-8");

    if (!options.json) {
      console.log(`Installed to ${filepath}`);
    }
  } catch (error) {
    timers.forEach(clearTimeout);
    spinner.fail("Audit failed");
    const message = error instanceof Error ? error.message : String(error);
    output.printError(message);
    process.exit(1);
  }
}
