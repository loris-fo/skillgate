import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { glob } from "glob";
import { auditViaApi } from "../lib/api-client.js";
import { createOutputHandler, printScanTable } from "../lib/output.js";
import { isBlocked } from "../lib/gating.js";
import type { AuditResponse } from "../types.js";

interface ScanOptions {
  path?: string;
  fail: boolean;
  json: boolean;
}

interface ScanResult {
  file: string;
  response?: AuditResponse;
  error?: string;
}

const CONCURRENCY_LIMIT = 5;
const RATE_LIMIT_THRESHOLD = 25;

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

export async function scanCommand(options: ScanOptions): Promise<void> {
  const defaultDirs = [".claude/", ".claude/skills/"];
  const scanDirs = options.path ? [options.path] : defaultDirs;

  // Discover files across all scan directories
  const allFiles: string[] = [];
  for (const dir of scanDirs) {
    const cwd = resolve(process.cwd(), dir);
    const files = await glob("**/*.md", { cwd });
    for (const file of files) {
      allFiles.push(resolve(cwd, file));
    }
  }

  // Deduplicate (in case .claude/skills/ overlaps with .claude/)
  const uniqueFiles = [...new Set(allFiles)];

  if (uniqueFiles.length === 0) {
    console.log("No skill files found");
    return;
  }

  if (uniqueFiles.length > RATE_LIMIT_THRESHOLD) {
    console.log(
      `Warning: scanning ${uniqueFiles.length} files may approach the API rate limit of 30/hour`,
    );
  }

  const output = createOutputHandler(options.json);
  const spinner = output.startSpinner(
    `Auditing skills... (0/${uniqueFiles.length})`,
  );

  const results: ScanResult[] = [];
  let completedCount = 0;

  await runWithConcurrencyLimit(uniqueFiles, CONCURRENCY_LIMIT, async (file) => {
    try {
      const content = readFileSync(file, "utf-8");
      const response = await auditViaApi({ content });
      results.push({ file, response });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({ file, error: message });
    }
    completedCount++;
    spinner.text = `Auditing skills... (${completedCount}/${uniqueFiles.length})`;
  });

  spinner.stop();

  // Output results
  if (options.json) {
    const jsonOutput = results.map((r) => ({
      file: r.file,
      result: r.response?.result ?? null,
      error: r.error ?? null,
    }));
    process.stdout.write(JSON.stringify(jsonOutput, null, 2) + "\n");
  } else {
    printScanTable(results);
  }

  // Gating: check if any result is blocked
  const hasBlocked = results.some(
    (r) => r.response && isBlocked(r.response.result.overall_score),
  );

  if (hasBlocked && options.fail) {
    process.exit(1);
  }
}
