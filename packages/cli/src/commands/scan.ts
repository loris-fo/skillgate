import { existsSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { glob } from "glob";
import {
  AGENT_SCAN_MAP,
  getAgentForPath,
  getAllScanPaths,
  getAgentDisplayName,
} from "@skillgate/shared";
import type { DetectedAgent } from "@skillgate/audit-engine";
import { auditViaApi } from "../lib/api-client.js";
import { createOutputHandler, printGroupedScanTable } from "../lib/output.js";
import { isBlocked } from "../lib/gating.js";
import type { AuditResponse } from "../types.js";

interface ScanOptions {
  path?: string;
  agent?: string;
  fail: boolean;
  json: boolean;
}

interface ScanResult {
  file: string;
  agent: DetectedAgent;
  response?: AuditResponse;
  error?: string;
}

const CONCURRENCY_LIMIT = 5;
const RATE_LIMIT_THRESHOLD = 25;

const VALID_AGENTS = AGENT_SCAN_MAP.map((e) => e.agent);

async function runWithConcurrencyLimit<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let running = 0;
  let index = 0;

  return new Promise((resolveAll, rejectAll) => {
    let completed = 0;
    const total = items.length;

    if (total === 0) {
      resolveAll();
      return;
    }

    function next(): void {
      while (running < limit && index < total) {
        const item = items[index++]!;
        running++;
        fn(item)
          .then(() => {
            running--;
            completed++;
            if (completed === total) {
              resolveAll();
            } else {
              next();
            }
          })
          .catch((err) => {
            rejectAll(err);
          });
      }
    }

    next();
  });
}

interface DiscoveredFile {
  absolutePath: string;
  agent: DetectedAgent;
}

async function discoverFiles(
  options: ScanOptions,
): Promise<DiscoveredFile[]> {
  const projectRoot = process.cwd();
  const seen = new Set<string>();
  const discovered: DiscoveredFile[] = [];

  // Filter scan map by --agent if provided
  const entries = options.agent
    ? AGENT_SCAN_MAP.filter((e) => e.agent === options.agent)
    : AGENT_SCAN_MAP;

  for (const entry of entries) {
    for (const scanPath of entry.paths) {
      if (scanPath.endsWith("/")) {
        // Directory path: glob for matching files
        const cwd = resolve(projectRoot, scanPath);
        const extPattern = entry.extensions.join(",");
        const pattern =
          entry.extensions.length === 1
            ? `**/*.${entry.extensions[0]}`
            : `**/*.{${extPattern}}`;

        try {
          const files = await glob(pattern, { cwd });
          for (const file of files) {
            const abs = resolve(cwd, file);
            if (!seen.has(abs)) {
              seen.add(abs);
              discovered.push({ absolutePath: abs, agent: entry.agent });
            }
          }
        } catch {
          // Directory doesn't exist, skip
        }
      } else {
        // Single file path: check existence
        const abs = resolve(projectRoot, scanPath);
        if (!seen.has(abs) && existsSync(abs)) {
          seen.add(abs);
          discovered.push({ absolutePath: abs, agent: entry.agent });
        }
      }
    }
  }

  // Handle additive --path option
  if (options.path) {
    const cwd = resolve(projectRoot, options.path);
    try {
      const files = await glob("**/*.md", { cwd });
      for (const file of files) {
        const abs = resolve(cwd, file);
        if (!seen.has(abs)) {
          seen.add(abs);
          // Use getAgentForPath to try to identify, falls back to "unknown"
          discovered.push({
            absolutePath: abs,
            agent: getAgentForPath(relative(projectRoot, abs)),
          });
        }
      }
    } catch {
      // Directory doesn't exist, skip
    }
  }

  return discovered;
}

export async function scanCommand(options: ScanOptions): Promise<void> {
  // Validate --agent flag
  if (options.agent) {
    if (!VALID_AGENTS.includes(options.agent as DetectedAgent)) {
      console.error(
        `Error: Invalid agent "${options.agent}". Valid agents: ${VALID_AGENTS.join(", ")}`,
      );
      process.exitCode = 1;
      return;
    }
  }

  const discovered = await discoverFiles(options);

  if (discovered.length === 0) {
    if (options.json) {
      const allPaths = getAllScanPaths();
      process.stdout.write(
        JSON.stringify(
          {
            results: [],
            directories_checked: allPaths,
            message: "No agent skill files found",
          },
          null,
          2,
        ) + "\n",
      );
    } else {
      const allPaths = getAllScanPaths();
      console.log("No agent skill files found\n");
      console.log("Directories checked:");
      for (const p of allPaths) {
        console.log(`  - ${p}`);
      }
      console.log("\nRun `skillgate install <url>` to add your first skill");
    }
    return;
  }

  if (discovered.length > RATE_LIMIT_THRESHOLD) {
    console.log(
      `Warning: scanning ${discovered.length} files may approach the API rate limit of 30/hour`,
    );
  }

  const output = createOutputHandler(options.json);
  const spinner = output.startSpinner(
    `Auditing skills... (0/${discovered.length})`,
  );

  const results: ScanResult[] = [];
  let completedCount = 0;

  await runWithConcurrencyLimit(
    discovered,
    CONCURRENCY_LIMIT,
    async (item) => {
      try {
        const content = readFileSync(item.absolutePath, "utf-8");
        const response = await auditViaApi({ content });
        results.push({
          file: item.absolutePath,
          agent: item.agent,
          response,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        results.push({ file: item.absolutePath, agent: item.agent, error: message });
      }
      completedCount++;
      spinner.text = `Auditing skills... (${completedCount}/${discovered.length})`;
    },
  );

  spinner.succeed(`Scanned ${discovered.length} skills`);

  // Output results
  if (options.json) {
    const jsonOutput = results.map((r) => ({
      file: r.file,
      agent: r.agent,
      result: r.response?.result ?? null,
      error: r.error ?? null,
    }));
    process.stdout.write(JSON.stringify(jsonOutput, null, 2) + "\n");
  } else {
    printGroupedScanTable(results);
  }

  // Gating: check if any result is blocked
  const hasBlocked = results.some(
    (r) => r.response && isBlocked(r.response.result.overall_score),
  );

  if (hasBlocked && options.fail) {
    process.exit(1);
  }
}
