import { Command } from "commander";
import * as fs from "fs";
import chalk from "chalk";
import { findClaudeMd, hasRouterBlock, removeRouterBlock } from "../installer.js";
import { personasDir } from "../utils.js";

export const removeCommand = new Command("remove")
  .description("Remove the persona router block from CLAUDE.md")
  .option("--personas", "Also remove ~/.claude/personas/ directory")
  .action((options) => {
    console.log(chalk.bold.blue("\nclaude-agent-personas") + " remove\n");

    const claudeMdPath = findClaudeMd();

    if (!claudeMdPath) {
      console.log(chalk.yellow("  No CLAUDE.md found. Nothing to remove.\n"));
      return;
    }

    const content = fs.readFileSync(claudeMdPath, "utf-8");
    if (!hasRouterBlock(content)) {
      console.log(chalk.yellow("  No router block found in CLAUDE.md. Nothing to remove.\n"));
      return;
    }

    const cleaned = removeRouterBlock(content);
    fs.writeFileSync(claudeMdPath, cleaned, "utf-8");
    console.log(chalk.green("  ✓") + ` Removed router block from ${claudeMdPath}`);

    if (options.personas) {
      const dir = personasDir();
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true });
        console.log(chalk.green("  ✓") + " Removed ~/.claude/personas/");
      }
    }

    console.log(chalk.bold.green("\n  ✓ Removal complete.\n"));
  });
