import { describe, it, expect } from "vitest";
import * as path from "path";
import { loadRouterConfig, countTokensApprox } from "../src/persona-manager";

describe("loadRouterConfig", () => {
  it("loads the bundled router-config.yml", () => {
    const configPath = path.join(__dirname, "..", "personas", "router-config.yml");
    const configs = loadRouterConfig(configPath);
    expect(configs.length).toBe(57);
  });

  it("parses persona fields correctly", () => {
    const configPath = path.join(__dirname, "..", "personas", "router-config.yml");
    const configs = loadRouterConfig(configPath);
    const dba = configs.find((c) => c.persona === "principal-postgresql-dba");
    expect(dba).toBeDefined();
    expect(dba!.signals).toContain("postgresql");
    expect(dba!.signals).toContain("postgres");
    expect(dba!.threshold).toBe(1);
    expect(dba!.priority).toBe(0);
    expect(dba!.disabled).toBe(false);
  });

  it("returns empty array for non-existent config", () => {
    const configs = loadRouterConfig("/nonexistent/path.yml");
    expect(configs).toEqual([]);
  });

  it("has correct number of signals per persona", () => {
    const configPath = path.join(__dirname, "..", "personas", "router-config.yml");
    const configs = loadRouterConfig(configPath);
    for (const config of configs) {
      expect(config.signals.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("all personas have unique names", () => {
    const configPath = path.join(__dirname, "..", "personas", "router-config.yml");
    const configs = loadRouterConfig(configPath);
    const names = configs.map((c) => c.persona);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("countTokensApprox", () => {
  it("returns a reasonable count for short text", () => {
    const count = countTokensApprox("hello world this is a test");
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(20);
  });

  it("returns 0 for empty string", () => {
    const count = countTokensApprox("");
    expect(count).toBe(0);
  });

  it("handles multi-line text", () => {
    const count = countTokensApprox("line one\nline two\nline three");
    expect(count).toBeGreaterThan(0);
  });
});
