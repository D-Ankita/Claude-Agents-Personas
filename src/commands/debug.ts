import { Command } from "commander";
import chalk from "chalk";
import { route, routeAll } from "../router.js";
import { loadRouterConfig } from "../persona-manager.js";

export const debugCommand = new Command("debug")
  .description("Show routing decision for a message")
  .argument("<message>", "The message to test routing against")
  .action((message: string) => {
    const configs = loadRouterConfig();

    if (configs.length === 0) {
      console.log(chalk.yellow("\n  No router config found. Run: persona init\n"));
      return;
    }

    console.log(chalk.bold.blue("\nclaude-agent-personas") + " debug\n");
    console.log(chalk.dim(`  Message: "${message}"\n`));

    const results = routeAll(message, configs);
    const winner = route(message, configs);

    if (results.length > 0) {
      console.log(
        "  " +
          chalk.bold("Persona".padEnd(24)) +
          chalk.bold("Signals Matched".padEnd(30)) +
          chalk.bold("Score".padEnd(8)) +
          chalk.bold("Load?")
      );
      console.log("  " + "─".repeat(68));

      for (const r of results) {
        const loadMarker = r.wouldLoad ? chalk.green("✓ YES") : chalk.dim("no");
        console.log(
          "  " +
            r.persona.padEnd(24) +
            r.signals.join(", ").padEnd(30) +
            String(r.score).padEnd(8) +
            loadMarker
        );
      }
    }

    console.log();
    if (winner.persona) {
      console.log(
        chalk.bold.green(
          `  Would load: ${winner.persona}.md (${winner.score} signal match${winner.score > 1 ? "es" : ""})`
        )
      );
    } else {
      console.log(chalk.dim("  No persona matched. Claude Code will use default behaviour."));
    }
    console.log();
  });
