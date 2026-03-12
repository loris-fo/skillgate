import { Command } from "commander";
import { installCommand } from "./commands/install.js";
import { scanCommand } from "./commands/scan.js";

const program = new Command();

program
  .name("skillgate")
  .description("Audit AI agent skills for security risks")
  .version("0.1.0");

program
  .command("install")
  .description("Audit and install an AI agent skill file")
  .argument("<source>", "URL, registry slug, or local file path")
  .option("-o, --output <dir>", "target directory", ".claude")
  .option("--force", "override High/Critical block")
  .option("--json", "output machine-readable JSON")
  .action(installCommand);

program
  .command("scan")
  .description("Audit all agent skill files in the project")
  .option("--path <dir>", "additional directory to scan")
  .option(
    "--agent <name>",
    "scan only a specific agent (claude, cursor, windsurf, copilot, cline, aider)",
  )
  .option("--no-fail", "always exit 0 (reporting only)")
  .option("--json", "output machine-readable JSON")
  .action(scanCommand);

program.parse();
