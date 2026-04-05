import { Command } from "commander";
import chalk from "chalk";
import { listInstalledPersonas } from "../persona-manager.js";

export const listCommand = new Command("list")
  .description("Show installed personas with token counts")
  .action(() => {
    const personas = listInstalledPersonas();

    if (personas.length === 0) {
      console.log(chalk.yellow("\n  No personas installed. Run: persona init\n"));
      return;
    }

    console.log(chalk.bold.blue("\nclaude-agent-personas") + " — installed personas\n");

    // Table header
    console.log(
      "  " +
        chalk.bold("Name".padEnd(28)) +
        chalk.bold("File".padEnd(26)) +
        chalk.bold("Tokens".padEnd(10)) +
        chalk.bold("Signals")
    );
    console.log("  " + "─".repeat(72));

    for (const p of personas) {
      const tokenColor =
        p.tokens > 800 ? chalk.red : p.tokens > 500 ? chalk.yellow : chalk.green;

      console.log(
        "  " +
          p.name.padEnd(28) +
          p.file.padEnd(26) +
          tokenColor(String(p.tokens).padEnd(10)) +
          String(p.signalCount)
      );
    }

    console.log();
  });
