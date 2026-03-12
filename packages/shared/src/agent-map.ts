import type { DetectedAgent } from "@skillgate/audit-engine";

export interface AgentScanEntry {
  agent: DetectedAgent;
  displayName: string;
  /** Glob patterns relative to project root */
  paths: string[];
  /** File extensions to match in directory paths */
  extensions: string[];
}

export const AGENT_SCAN_MAP: AgentScanEntry[] = [
  {
    agent: "claude",
    displayName: "Claude",
    paths: [".claude/skills/"],
    extensions: ["md"],
  },
  {
    agent: "cursor",
    displayName: "Cursor",
    paths: [".cursor/rules/", ".cursorrules"],
    extensions: ["md", "mdc"],
  },
  {
    agent: "windsurf",
    displayName: "Windsurf",
    paths: [".windsurfrules"],
    extensions: ["md"],
  },
  {
    agent: "copilot",
    displayName: "Copilot",
    paths: [".github/copilot-instructions.md"],
    extensions: ["md"],
  },
  {
    agent: "cline",
    displayName: "Cline",
    paths: [".clinerules"],
    extensions: ["md"],
  },
  {
    agent: "aider",
    displayName: "Aider",
    paths: [".aider.conf.yml", ".aiderignore"],
    extensions: ["yml", "md"],
  },
];

/**
 * Returns a flat list of all scan paths from all agents.
 */
export function getAllScanPaths(): string[] {
  return AGENT_SCAN_MAP.flatMap((entry) => entry.paths);
}

/**
 * Returns the display name for a given agent, or titlecase of the agent string.
 */
export function getAgentDisplayName(agent: DetectedAgent): string {
  const entry = AGENT_SCAN_MAP.find((e) => e.agent === agent);
  if (entry) return entry.displayName;
  return agent.charAt(0).toUpperCase() + agent.slice(1);
}

/**
 * Given a file path, determine which agent it belongs to by matching
 * against AGENT_SCAN_MAP paths. Returns "unknown" if no match.
 */
export function getAgentForPath(filePath: string): DetectedAgent {
  // Normalize to forward slashes for matching
  const normalized = filePath.replace(/\\/g, "/");

  for (const entry of AGENT_SCAN_MAP) {
    for (const scanPath of entry.paths) {
      // For directory paths (ending with /), check if file is inside
      if (scanPath.endsWith("/")) {
        if (normalized.includes(scanPath) || normalized.startsWith(scanPath)) {
          return entry.agent;
        }
      } else {
        // For single files, check if path ends with or equals the scan path
        if (normalized.endsWith(scanPath) || normalized === scanPath) {
          return entry.agent;
        }
      }
    }
  }

  return "unknown";
}
