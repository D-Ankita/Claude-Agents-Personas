import * as path from "path";
import * as fs from "fs";
import * as os from "os";

/** Persona install directory */
export function personasDir(): string {
  return path.join(os.homedir(), ".claude", "personas");
}

/** ~/.claude directory */
export function claudeDir(): string {
  return path.join(os.homedir(), ".claude");
}

/** Path to the bundled personas inside the npm package */
export function bundledPersonasDir(): string {
  return path.join(__dirname, "..", "personas");
}

/** Path to the bundled snippets inside the npm package */
export function bundledSnippetsDir(): string {
  return path.join(__dirname, "..", "snippets");
}

/** Read a file and return contents, or null if not found */
export function readFileOrNull(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

/** Ensure a directory exists, creating it recursively if needed */
export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

/** List all .md files in a directory */
export function listMdFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"));
}

/** Copy a file from src to dest, overwriting if exists */
export function copyFile(src: string, dest: string): void {
  fs.copyFileSync(src, dest);
}

/** Parse simple YAML frontmatter from a markdown file */
export function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const frontmatter: Record<string, unknown> = {};
  const lines = match[1].split("\n");
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value: unknown = line.slice(colonIdx + 1).trim();

    // Handle arrays like [a, b, c]
    if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim());
    }
    // Handle numbers
    else if (typeof value === "string" && /^\d+$/.test(value)) {
      value = parseInt(value, 10);
    }
    // Strip inline comments
    else if (typeof value === "string") {
      value = value.replace(/#.*$/, "").trim();
    }

    frontmatter[key] = value;
  }

  return { frontmatter, body: match[2] };
}
