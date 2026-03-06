import chalk from "chalk";
import Table from "cli-table3";
import ora from "ora";
import type { AuditResponse, Score } from "../types.js";
import type { Verdict } from "../types.js";

const VERDICT_EMOJI: Record<Verdict, string> = {
  install: "\u2705",
  install_with_caution: "\u26A0\uFE0F",
  review_first: "\u26A0\uFE0F",
  avoid: "\u274C",
};

const VERDICT_DISPLAY: Record<Verdict, string> = {
  install: chalk.green("Install"),
  install_with_caution: chalk.yellow("Install with Caution"),
  review_first: chalk.hex("#FF8800")("Review First"),
  avoid: chalk.red("Avoid"),
};

const SCORE_COLOR: Record<Score, (s: string) => string> = {
  safe: chalk.green,
  low: chalk.cyan,
  moderate: chalk.yellow,
  high: chalk.hex("#FF8800"),
  critical: chalk.red,
};

export function printCompactResult(response: AuditResponse): void {
  const { result, meta } = response;
  const verdict =
    VERDICT_DISPLAY[result.recommendation.verdict] ??
    result.recommendation.verdict;
  const emoji = VERDICT_EMOJI[result.recommendation.verdict] ?? "";
  const scoreColor = SCORE_COLOR[result.overall_score] ?? ((s: string) => s);

  console.log(
    `\n${emoji} ${verdict}  Score: ${scoreColor(result.overall_score)}`,
  );

  for (const [key, cat] of Object.entries(result.categories)) {
    const label = key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const color = SCORE_COLOR[cat.score as Score] ?? ((s: string) => s);
    console.log(`  ${color(cat.score.padEnd(10))} ${label}`);
  }

  console.log(`\nFull report: https://skillgate.dev/report/${meta.slug}`);
}

export function createOutputHandler(jsonMode: boolean) {
  return {
    startSpinner(text: string) {
      if (jsonMode) {
        return {
          stop() {},
          fail(_message?: string) {},
          succeed(_message?: string) {},
          isSpinning: false,
          text: "",
        } as unknown as ReturnType<typeof ora>;
      }
      return ora({ text, stream: process.stderr }).start();
    },

    printResult(response: AuditResponse) {
      if (jsonMode) {
        process.stdout.write(JSON.stringify(response, null, 2) + "\n");
        return;
      }
      printCompactResult(response);
    },

    printError(message: string) {
      if (jsonMode) {
        process.stdout.write(
          JSON.stringify({ error: { message } }, null, 2) + "\n",
        );
        return;
      }
      console.error(chalk.red(`Error: ${message}`));
    },
  };
}

export function printScanTable(
  results: Array<{ file: string; response?: AuditResponse; error?: string }>,
): void {
  const table = new Table({
    head: ["File", "Verdict", "Score"],
    style: { head: ["cyan"] },
  });

  let passed = 0;
  let failed = 0;

  for (const item of results) {
    if (item.error) {
      table.push([item.file, chalk.red("Error"), item.error]);
      failed++;
    } else if (item.response) {
      const verdict =
        VERDICT_DISPLAY[item.response.result.recommendation.verdict] ??
        item.response.result.recommendation.verdict;
      const scoreColor =
        SCORE_COLOR[item.response.result.overall_score] ??
        ((s: string) => s);
      table.push([
        item.file,
        verdict,
        scoreColor(item.response.result.overall_score),
      ]);
      const blocked = ["high", "critical"].includes(
        item.response.result.overall_score,
      );
      if (blocked) {
        failed++;
      } else {
        passed++;
      }
    }
  }

  console.log(table.toString());
  console.log(`\n${passed} passed, ${failed} failed`);
}
