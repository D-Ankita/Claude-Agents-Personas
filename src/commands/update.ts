import { Command } from "commander";
import chalk from "chalk";
import { updatePersonas } from "../persona-manager.js";

export const updateCommand = new Command("update")
  .description("Refresh persona files from the bundled package")
  .action(() => {
    console.log(chalk.bold.blue("\nclaude-agent-personas") + " update\n");

    const { updated, added, unchanged } = updatePersonas();

    if (updated > 0) console.log(chalk.green(`  ✓ Updated: ${updated}`));
    if (added > 0) console.log(chalk.green(`  ✓ Added: ${added}`));
    if (unchanged > 0) console.log(chalk.dim(`  ○ Unchanged: ${unchanged}`));

    console.log(chalk.bold.green("\n  ✓ Personas refreshed.\n"));
  });
