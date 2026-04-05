import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { ensureDir, claudeDir, personasDir, bundledSnippetsDir } from "../utils.js";
import { installPersonas, installRouterConfig, Profile } from "../persona-manager.js";
import { findClaudeMd, hasRouterBlock, appendRouterBlock, createClaudeMd } from "../installer.js";

export const initCommand = new Command("init")
  .description("Install persona routing system into Claude Code")
  .option("--dry-run", "Show what would happen, write nothing")
  .option("--profile <profile>", "Persona profile to install (engineering, business, creative-data, all)", "all")
  .option("--force", "Overwrite existing files")
  .action(async (options) => {
    const dryRun = options.dryRun || false;
    const profile = options.profile as Profile;
    const force = options.force || false;

    // Banner
    console.log(chalk.bold.blue("\nclaude-agent-personas") + " v1.0.0\n");

    if (dryRun) {
      console.log(chalk.yellow("  [DRY RUN] No files will be written.\n"));
    }

    // Step 1-2: Ensure directories
    if (!dryRun) {
      ensureDir(claudeDir());
      ensureDir(personasDir());
    }
    console.log(chalk.green("  ✓") + " Ensured ~/.claude/personas/ exists");

    // Step 3: Copy router-config.yml
    if (!dryRun) {
      const installed = installRouterConfig(force);
      if (installed) {
        console.log(chalk.green("  ✓") + " Installed router-config.yml");
      } else {
        console.log(chalk.dim("  ○ router-config.yml already exists (skipped)"));
      }
    } else {
      console.log(chalk.dim("  ○ Would install router-config.yml"));
    }

    // Step 4: Copy persona files
    if (!dryRun) {
      const { copied, skipped } = installPersonas(profile, force);
      console.log(chalk.green("  ✓") + ` Installed ${copied} personas (${skipped} skipped)`);
    } else {
      console.log(chalk.dim(`  ○ Would install personas (profile: ${profile})`));
    }

    // Step 5-10: Handle CLAUDE.md
    const routerBlock = fs.readFileSync(
      path.join(bundledSnippetsDir(), "claude-md-block.md"),
      "utf-8"
    );

    const claudeMdPath = findClaudeMd();

    if (claudeMdPath) {
      const content = fs.readFileSync(claudeMdPath, "utf-8");
      if (hasRouterBlock(content)) {
        console.log(chalk.dim("  ○ Already installed. Run persona update to refresh."));
      } else if (!dryRun) {
        appendRouterBlock(claudeMdPath, routerBlock);
        console.log(chalk.green("  ✓") + ` Appended router block to ${claudeMdPath}`);
      } else {
        console.log(chalk.dim(`  ○ Would append router block to ${claudeMdPath}`));
      }
    } else {
      if (!dryRun) {
        const created = createClaudeMd(claudeDir(), routerBlock);
        console.log(chalk.green("  ✓") + ` Created ${created} with router block`);
      } else {
        console.log(chalk.dim("  ○ Would create ~/.claude/CLAUDE.md"));
      }
    }

    // Success summary
    console.log(chalk.bold.green("\n  ✓ Setup complete!\n"));
    console.log(chalk.dim("  Quick start:"));
    console.log(`  Try: ${chalk.cyan('"why is my postgres query slow?"')}  → loads dba-expert`);
    console.log(`  Try: ${chalk.cyan('"review this NDA clause"')}          → loads contract-lawyer`);
    console.log(`  Try: ${chalk.cyan('"@staff-engineer design this API"')} → forces staff-engineer`);
    console.log();
  });
