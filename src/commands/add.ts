import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { lintPersona } from "../persona-manager.js";
import { personasDir, ensureDir } from "../utils.js";

export const addCommand = new Command("add")
  .description("Install a custom persona file")
  .argument("<source>", "Path to a local persona .md file or URL")
  .action(async (source: string) => {
    console.log(chalk.bold.blue("\nclaude-agent-personas") + " add\n");

    let filePath: string;
    let tempFile: string | null = null;

    if (source.startsWith("http://") || source.startsWith("https://")) {
      // Fetch from URL
      console.log(chalk.dim(`  Fetching ${source}...`));
      try {
        const response = await fetch(source);
        if (!response.ok) {
          console.log(chalk.red(`  ✗ Failed to fetch: ${response.status} ${response.statusText}\n`));
          process.exit(1);
        }
        const content = await response.text();
        tempFile = path.join(personasDir(), "_temp_add.md");
        ensureDir(personasDir());
        fs.writeFileSync(tempFile, content, "utf-8");
        filePath = tempFile;
      } catch (err) {
        console.log(chalk.red(`  ✗ Failed to fetch URL: ${err}\n`));
        process.exit(1);
        return;
      }
    } else {
      filePath = path.resolve(source);
      if (!fs.existsSync(filePath)) {
        console.log(chalk.red(`  ✗ File not found: ${filePath}\n`));
        process.exit(1);
      }
    }

    // Lint the file
    const result = await lintPersona(filePath);

    if (result.errors.length > 0) {
      console.log(chalk.red("  Lint errors found:\n"));
      for (const err of result.errors) {
        console.log(chalk.red(`    ✗ ${err}`));
      }
      if (tempFile) fs.unlinkSync(tempFile);
      console.log(chalk.red("\n  Persona not installed. Fix errors and try again.\n"));
      process.exit(1);
    }

    // Copy to personas directory
    const destName = tempFile
      ? path.basename(source).replace(/[^a-zA-Z0-9.-]/g, "-")
      : path.basename(filePath);
    const dest = path.join(personasDir(), destName);
    ensureDir(personasDir());

    if (tempFile) {
      fs.renameSync(tempFile, dest);
    } else {
      fs.copyFileSync(filePath, dest);
    }

    console.log(chalk.green("  ✓") + ` Installed ${destName} to ~/.claude/personas/`);

    if (result.warnings.length > 0) {
      for (const warn of result.warnings) {
        console.log(chalk.yellow(`    ⚠ ${warn}`));
      }
    }

    console.log(
      chalk.dim(`\n  To activate: add signals to ~/.claude/personas/router-config.yml\n`)
    );
  });
