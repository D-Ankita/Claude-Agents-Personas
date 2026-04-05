import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { hasRouterBlock, removeRouterBlock, appendRouterBlock, createClaudeMd } from "../src/installer";

const BEGIN_MARKER = "<!-- claude-agent-personas:begin -->";
const END_MARKER = "<!-- claude-agent-personas:end -->";
const ROUTER_BLOCK = `${BEGIN_MARKER}\n## Persona Router\nTest content here.\n${END_MARKER}`;

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "persona-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("hasRouterBlock", () => {
  it("returns true when marker is present", () => {
    expect(hasRouterBlock(`some content\n${BEGIN_MARKER}\nrouter\n${END_MARKER}`)).toBe(true);
  });

  it("returns false when no marker is present", () => {
    expect(hasRouterBlock("some content without markers")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(hasRouterBlock("")).toBe(false);
  });
});

describe("removeRouterBlock", () => {
  it("removes the router block from content", () => {
    const content = `# My CLAUDE.md\n\nSome rules here.\n\n${ROUTER_BLOCK}\n`;
    const result = removeRouterBlock(content);
    expect(result).not.toContain(BEGIN_MARKER);
    expect(result).not.toContain(END_MARKER);
    expect(result).toContain("My CLAUDE.md");
    expect(result).toContain("Some rules here.");
  });

  it("handles Windows line endings", () => {
    const content = `# My CLAUDE.md\r\n\r\n${BEGIN_MARKER}\r\nRouter content\r\n${END_MARKER}\r\n`;
    const result = removeRouterBlock(content);
    expect(result).not.toContain(BEGIN_MARKER);
    expect(result).not.toContain(END_MARKER);
  });

  it("returns content unchanged when no markers present", () => {
    const content = "# Just a normal file\nNo markers here.";
    expect(removeRouterBlock(content)).toBe(content);
  });

  it("handles router block at the very start", () => {
    const content = `${ROUTER_BLOCK}\nSome content after.`;
    const result = removeRouterBlock(content);
    expect(result).not.toContain(BEGIN_MARKER);
  });

  it("handles router block at the very end", () => {
    const content = `Some content before.\n\n${ROUTER_BLOCK}`;
    const result = removeRouterBlock(content);
    expect(result).not.toContain(BEGIN_MARKER);
    expect(result).toContain("Some content before.");
  });
});

describe("appendRouterBlock", () => {
  it("appends the router block to a file", () => {
    const filePath = path.join(tmpDir, "CLAUDE.md");
    fs.writeFileSync(filePath, "# Existing content\n", "utf-8");

    appendRouterBlock(filePath, ROUTER_BLOCK);

    const result = fs.readFileSync(filePath, "utf-8");
    expect(result).toContain("# Existing content");
    expect(result).toContain(BEGIN_MARKER);
    expect(result).toContain(END_MARKER);
  });

  it("adds exactly 2 blank lines before the block", () => {
    const filePath = path.join(tmpDir, "CLAUDE.md");
    fs.writeFileSync(filePath, "# Existing content", "utf-8");

    appendRouterBlock(filePath, ROUTER_BLOCK);

    const result = fs.readFileSync(filePath, "utf-8");
    expect(result).toContain("# Existing content\n\n" + ROUTER_BLOCK);
  });

  it("is idempotent — does not append twice", () => {
    const filePath = path.join(tmpDir, "CLAUDE.md");
    fs.writeFileSync(filePath, "# Existing content\n", "utf-8");

    appendRouterBlock(filePath, ROUTER_BLOCK);
    appendRouterBlock(filePath, ROUTER_BLOCK);

    const result = fs.readFileSync(filePath, "utf-8");
    const count = (result.match(new RegExp(BEGIN_MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
    expect(count).toBe(1);
  });

  it("throws if file does not exist", () => {
    expect(() => {
      appendRouterBlock(path.join(tmpDir, "nonexistent.md"), ROUTER_BLOCK);
    }).toThrow("File does not exist");
  });
});

describe("createClaudeMd", () => {
  it("creates CLAUDE.md with the router block", () => {
    const dir = path.join(tmpDir, "new-dir");
    const filePath = createClaudeMd(dir, ROUTER_BLOCK);

    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain(BEGIN_MARKER);
    expect(content).toContain(END_MARKER);
  });

  it("creates nested directories if needed", () => {
    const dir = path.join(tmpDir, "a", "b", "c");
    createClaudeMd(dir, ROUTER_BLOCK);
    expect(fs.existsSync(path.join(dir, "CLAUDE.md"))).toBe(true);
  });
});
