import fs from "node:fs";
import { resolveInput } from "../lib/input-resolver.js";
import { auditViaApi } from "../lib/api-client.js";
import { isBlocked } from "../lib/gating.js";
import { createOutputHandler } from "../lib/output.js";
import {
  AGENT_SCAN_MAP,
  getInstallPath,
  getAgentDisplayName,
  getAgentForPath,
} from "@skillgate/shared";
import type { DetectedAgent } from "@skillgate/audit-engine";

interface InstallOptions {
  agent?: string;
  output?: string;
  force: boolean;
  json: boolean;
}

const VALID_AGENTS = AGENT_SCAN_MAP.map((e) => e.agent);

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

  // Mutual exclusion: --agent and -o/--output
  if (options.agent && options.output) {
    console.error(
      "Error: --agent and -o/--output are mutually exclusive. Use --agent to target an agent directory, or -o for a custom path.",
    );
    process.exitCode = 1;
    return;
  }

  // Resolve target directory
  let targetDir: string;

  if (options.agent) {
    // Validate agent name
    if (!VALID_AGENTS.includes(options.agent as DetectedAgent)) {
      console.error(
        `Error: Unknown agent "${options.agent}". Known agents: ${VALID_AGENTS.join(", ")}`,
      );
      process.exitCode = 1;
      return;
    }

    const installPath = getInstallPath(options.agent);
    if (!installPath) {
      const entry = AGENT_SCAN_MAP.find((e) => e.agent === options.agent)!;
      console.error(
        `Error: Agent "${options.agent}" doesn't support directory-based install. Supported: claude, cursor. ${getAgentDisplayName(options.agent as DetectedAgent)} uses a single ${entry.paths[0]} file -- copy content manually.`,
      );
      process.exitCode = 1;
      return;
    }

    targetDir = installPath;
  } else if (options.output) {
    targetDir = options.output;
  } else {
    // Default: install into .claude/skills/ (backward-compatible)
    targetDir = ".claude/skills/";
  }

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

    // Send URL alongside content so API can perform URL-based agent detection
    const auditPayload: { content: string; url?: string } =
      resolved.type === "url"
        ? { content, url: resolved.url }
        : { content };
    const response = await auditViaApi(auditPayload);

    // Local URL-based detection fallback when API doesn't detect agent
    if (
      resolved.type === "url" &&
      (!response.result.detected_agent ||
        response.result.detected_agent === "unknown")
    ) {
      try {
        const urlPath = new URL(resolved.url).pathname;
        const localAgent = getAgentForPath(urlPath);
        if (localAgent !== "unknown") {
          response.result.detected_agent = localAgent;
        }
      } catch {
        /* skip invalid URLs */
      }
    }

    timers.forEach(clearTimeout);
    spinner.succeed("Audit complete");
    output.printResult(response);

    // Check gating
    if (isBlocked(response.result.overall_score) && !options.force) {
      console.error("Use --force to override.");
      process.exitCode = 1;
      return;
    }

    // Extract skill name and write file
    const skillName = extractSkillName(content);
    const filename = `${skillName}.md`;
    const filepath = `${targetDir}/${filename}`;

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(filepath, content, "utf-8");

    if (!options.json) {
      console.log(`Installed to ${filepath}`);
    }
  } catch (error) {
    timers.forEach(clearTimeout);
    spinner.fail("Audit failed");
    const message = error instanceof Error ? error.message : String(error);
    output.printError(message);
    process.exitCode = 1;
  }
}
