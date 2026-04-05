import * as fs from "fs";
import * as path from "path";
import { claudeDir, readFileOrNull } from "./utils.js";

const BEGIN_MARKER = "<!-- claude-agent-personas:begin -->";
const END_MARKER = "<!-- claude-agent-personas:end -->";

/**
 * Find CLAUDE.md: check ./CLAUDE.md first, then ~/.claude/CLAUDE.md.
 * Returns the path or null.
 */
export function findClaudeMd(): string | null {
  const local = path.resolve("CLAUDE.md");
  if (fs.existsSync(local)) return local;

  const global = path.join(claudeDir(), "CLAUDE.md");
  if (fs.existsSync(global)) return global;

  return null;
}

/**
 * Check if content contains the router block.
 */
export function hasRouterBlock(content: string): boolean {
  return content.includes(BEGIN_MARKER);
}

/**
 * Append the router block to a file. Idempotent — checks hasRouterBlock first.
 * Throws if filePath does not exist.
 */
export function appendRouterBlock(filePath: string, block: string): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  if (hasRouterBlock(content)) return;

  fs.writeFileSync(filePath, content + "\n\n" + block, "utf-8");
}

/**
 * Remove everything from :begin to :end marker inclusive.
 * Handles both Windows (\r\n) and Unix (\n) line endings.
 */
export function removeRouterBlock(content: string): string {
  const beginIdx = content.indexOf(BEGIN_MARKER);
  const endIdx = content.indexOf(END_MARKER);

  if (beginIdx === -1 || endIdx === -1) return content;

  const before = content.slice(0, beginIdx);
  const after = content.slice(endIdx + END_MARKER.length);

  // Clean up extra blank lines left behind
  return (before.replace(/\n\n$/, "\n") + after.replace(/^\r?\n/, "")).trimEnd() + "\n";
}

/**
 * Create ~/.claude/CLAUDE.md with the router block as content.
 */
export function createClaudeMd(dirPath: string, block: string): string {
  const filePath = path.join(dirPath, "CLAUDE.md");
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(filePath, block + "\n", "utf-8");
  return filePath;
}
