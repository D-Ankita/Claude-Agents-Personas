import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { lintPersona, updateTokenCount } from "../persona-manager.js";
import { listMdFiles } from "../utils.js";

export const lintCommand = new Command("lint")
  .description("Validate persona files and show token counts")
  .argument("<path>", "Path to a persona file or directory")
  .action(async (targetPath: string) => {
    console.log(chalk.bold.blue("\nclaude-agent-personas") + " lint\n");

    const resolved = path.resolve(targetPath);
    let files: string[];

    if (fs.statSync(resolved).isDirectory()) {
      files = listMdFiles(resolved).map((f) => path.join(resolved, f));
    } else {
      files = [resolved];
    }

    if (files.length === 0) {
      console.log(chalk.yellow("  No .md files found.\n"));
      return;
    }

    let hasErrors = false;

    for (const file of files) {
      const result = await lintPersona(file);

      console.log(chalk.bold(`  ${result.file}`) + chalk.dim(` (${result.tokenCount} tokens)`));

      if (result.errors.length === 0 && result.warnings.length === 0) {
        console.log(chalk.green("    ✓ All checks passed"));
      }

      for (const err of result.errors) {
        console.log(chalk.red(`    ✗ ${err}`));
        hasErrors = true;
      }

      for (const warn of result.warnings) {
        console.log(chalk.yellow(`    ⚠ ${warn}`));
      }

      // Auto-fill token count
      await updateTokenCount(file);

      console.log();
    }

    if (hasErrors) {
      process.exit(1);
    }
  });
