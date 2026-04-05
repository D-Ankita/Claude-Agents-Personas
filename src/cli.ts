#!/usr/bin/env node

import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { updateCommand } from "./commands/update.js";
import { listCommand } from "./commands/list.js";
import { debugCommand } from "./commands/debug.js";
import { removeCommand } from "./commands/remove.js";
import { lintCommand } from "./commands/lint.js";
import { addCommand } from "./commands/add.js";

const program = new Command();

program
  .name("persona")
  .description("Intelligent persona routing OS for Claude Code")
  .version("1.0.0");

program.addCommand(initCommand);
program.addCommand(updateCommand);
program.addCommand(listCommand);
program.addCommand(debugCommand);
program.addCommand(removeCommand);
program.addCommand(lintCommand);
program.addCommand(addCommand);

program.parse(process.argv);
