import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import {
  personasDir,
  bundledPersonasDir,
  ensureDir,
  listMdFiles,
  copyFile,
  parseFrontmatter,
} from "./utils.js";
import { PersonaConfig } from "./router.js";

export type Profile = "all" | "engineering" | "business" | "creative-data";

const PROFILE_DIRS: Record<Profile, string[]> = {
  all: ["engineering", "business", "creative-data"],
  engineering: ["engineering"],
  business: ["business"],
  "creative-data": ["creative-data"],
};

/**
 * Copy persona files from the bundled package to ~/.claude/personas/
 * Returns counts of copied/skipped files.
 */
export function installPersonas(
  profile: Profile = "all",
  force = false
): { copied: number; skipped: number } {
  const destDir = personasDir();
  ensureDir(destDir);

  const srcBase = bundledPersonasDir();
  const dirs = PROFILE_DIRS[profile] || PROFILE_DIRS.all;

  let copied = 0;
  let skipped = 0;

  for (const dir of dirs) {
    const srcDir = path.join(srcBase, dir);
    if (!fs.existsSync(srcDir)) continue;

    const files = listMdFiles(srcDir);
    for (const file of files) {
      const dest = path.join(destDir, file);
      if (fs.existsSync(dest) && !force) {
        skipped++;
      } else {
        copyFile(path.join(srcDir, file), dest);
        copied++;
      }
    }
  }

  return { copied, skipped };
}

/**
 * Copy router-config.yml to ~/.claude/personas/
 */
export function installRouterConfig(force = false): boolean {
  const src = path.join(bundledPersonasDir(), "router-config.yml");
  const dest = path.join(personasDir(), "router-config.yml");

  if (fs.existsSync(dest) && !force) return false;

  ensureDir(personasDir());
  copyFile(src, dest);
  return true;
}

/**
 * Update persona files from bundled package (overwrite all).
 * Does NOT touch router-config.yml.
 */
export function updatePersonas(): { updated: number; added: number; unchanged: number } {
  const destDir = personasDir();
  ensureDir(destDir);

  const srcBase = bundledPersonasDir();
  let updated = 0;
  let added = 0;
  let unchanged = 0;

  for (const dir of PROFILE_DIRS.all) {
    const srcDir = path.join(srcBase, dir);
    if (!fs.existsSync(srcDir)) continue;

    const files = listMdFiles(srcDir);
    for (const file of files) {
      const src = path.join(srcDir, file);
      const dest = path.join(destDir, file);

      if (!fs.existsSync(dest)) {
        copyFile(src, dest);
        added++;
      } else {
        const srcContent = fs.readFileSync(src, "utf-8");
        const destContent = fs.readFileSync(dest, "utf-8");
        if (srcContent !== destContent) {
          copyFile(src, dest);
          updated++;
        } else {
          unchanged++;
        }
      }
    }
  }

  return { updated, added, unchanged };
}

/**
 * Load router-config.yml and return PersonaConfig array.
 */
export function loadRouterConfig(configPath?: string): PersonaConfig[] {
  const filePath = configPath || path.join(personasDir(), "router-config.yml");
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, "utf-8");
  const parsed = yaml.load(content) as { personas?: Array<Record<string, unknown>> };

  if (!parsed?.personas || !Array.isArray(parsed.personas)) return [];

  return parsed.personas.map((p) => ({
    persona: String(p.id || p.persona || ""),
    signals: Array.isArray(p.signals) ? p.signals.map(String) : [],
    threshold: typeof p.threshold === "number" ? p.threshold : 1,
    priority: typeof p.priority === "number" ? p.priority : 0,
    disabled: p.disabled === true,
    description: p.description ? String(p.description) : undefined,
  })) as PersonaConfig[];
}

/**
 * List all installed personas with metadata.
 */
export function listInstalledPersonas(): Array<{
  name: string;
  file: string;
  tokens: number;
  signalCount: number;
  description?: string;
}> {
  const dir = personasDir();
  if (!fs.existsSync(dir)) return [];

  const configs = loadRouterConfig();
  const files = listMdFiles(dir);

  return files.map((file) => {
    const content = fs.readFileSync(path.join(dir, file), "utf-8");
    const { frontmatter } = parseFrontmatter(content);
    const config = configs.find((c) => c.persona === file.replace(".md", ""));

    return {
      name: (frontmatter.name as string) || file.replace(".md", ""),
      file,
      tokens: typeof frontmatter.tokens === "number" ? frontmatter.tokens : countTokensApprox(content),
      signalCount: config?.signals.length ?? 0,
      description: config ? (config as unknown as Record<string, unknown>).description as string | undefined : undefined,
    };
  });
}

/**
 * Approximate token count (words * 1.3). Used as fallback when tiktoken unavailable.
 */
export function countTokensApprox(text: string): number {
  return Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.3);
}

/**
 * Count tokens using tiktoken (cl100k_base encoding).
 */
export async function countTokens(text: string): Promise<number> {
  try {
    const { encoding_for_model } = await import("tiktoken");
    const enc = encoding_for_model("gpt-4");
    const tokens = enc.encode(text);
    const count = tokens.length;
    enc.free();
    return count;
  } catch {
    return countTokensApprox(text);
  }
}

export interface LintResult {
  file: string;
  errors: string[];
  warnings: string[];
  tokenCount: number;
}

/**
 * Lint a persona file for required structure and token budget.
 */
export async function lintPersona(filePath: string): Promise<LintResult> {
  const content = fs.readFileSync(filePath, "utf-8");
  const { frontmatter, body } = parseFrontmatter(content);
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required frontmatter fields
  for (const field of ["name", "version", "author", "signals"]) {
    if (!frontmatter[field]) {
      errors.push(`Missing required frontmatter field: ${field}`);
    }
  }

  // Check signals has at least 3 keywords
  if (Array.isArray(frontmatter.signals) && frontmatter.signals.length < 3) {
    errors.push(`Signals list must have at least 3 keywords (found ${frontmatter.signals.length})`);
  }

  // Check required sections
  const requiredSections = ["Identity", "Mindset", "Communication Style", "Expertise", "Approach"];
  for (const section of requiredSections) {
    if (!body.includes(`## ${section}`)) {
      errors.push(`Missing required section: ## ${section}`);
    }
  }

  // Token count
  const tokenCount = await countTokens(content);

  if (tokenCount > 800) {
    warnings.push(`Token count is ${tokenCount} (over 800) — strongly consider trimming`);
  } else if (tokenCount > 500) {
    warnings.push(`Token count is ${tokenCount} (over 500 budget)`);
  }

  return {
    file: path.basename(filePath),
    errors,
    warnings,
    tokenCount,
  };
}

/**
 * Update the tokens field in a persona file's frontmatter.
 */
export async function updateTokenCount(filePath: string): Promise<number> {
  const content = fs.readFileSync(filePath, "utf-8");
  const tokenCount = await countTokens(content);

  const updated = content.replace(
    /^(---\n[\s\S]*?)(tokens:\s*\d+.*\n)?/,
    (match, before) => {
      if (content.includes("tokens:")) {
        return content.replace(/tokens:\s*\d+.*/, `tokens: ${tokenCount}`).slice(0, before.length + `tokens: ${tokenCount}\n`.length);
      }
      return before;
    }
  );

  // Simpler approach: just replace or add tokens field
  if (content.includes("tokens:")) {
    const newContent = content.replace(/tokens:\s*\d+.*/, `tokens: ${tokenCount}`);
    fs.writeFileSync(filePath, newContent, "utf-8");
  } else {
    const newContent = content.replace(/---\n/, `---\ntokens: ${tokenCount}\n`);
    // Only write if we're adding after the first ---
    if (newContent !== content) {
      // Actually, insert before the closing ---
      const newContent2 = content.replace(/\n---\n/, `\ntokens: ${tokenCount}\n---\n`);
      fs.writeFileSync(filePath, newContent2, "utf-8");
    }
  }

  return tokenCount;
}
