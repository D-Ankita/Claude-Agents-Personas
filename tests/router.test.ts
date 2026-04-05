import { describe, it, expect } from "vitest";
import { route, routeAll, PersonaConfig } from "../src/router";

const configs: PersonaConfig[] = [
  {
    persona: "dba-expert",
    signals: ["sql", "query", "postgres", "mysql", "mongo", "index", "slow", "explain"],
    threshold: 1,
    priority: 0,
    disabled: false,
  },
  {
    persona: "security-auditor",
    signals: ["security", "vulnerability", "cve", "auth", "injection", "xss", "owasp"],
    threshold: 1,
    priority: 0,
    disabled: false,
  },
  {
    persona: "contract-lawyer",
    signals: ["contract", "agreement", "clause", "nda", "terms", "liability", "indemnify"],
    threshold: 1,
    priority: 0,
    disabled: false,
  },
  {
    persona: "staff-engineer",
    signals: ["architecture", "scale", "system design", "tradeoff", "distributed"],
    threshold: 1,
    priority: 0,
    disabled: false,
  },
  {
    persona: "disabled-persona",
    signals: ["sql", "query"],
    threshold: 1,
    priority: 10,
    disabled: true,
  },
  {
    persona: "high-threshold",
    signals: ["sql", "query", "postgres"],
    threshold: 3,
    priority: 0,
    disabled: false,
  },
];

describe("route", () => {
  // Basic matching
  it("returns null for empty message", () => {
    const result = route("", configs);
    expect(result.persona).toBeNull();
    expect(result.score).toBe(0);
    expect(result.method).toBe("auto");
  });

  it("returns null for whitespace-only message", () => {
    const result = route("   ", configs);
    expect(result.persona).toBeNull();
  });

  it("returns null for all-punctuation message", () => {
    const result = route("!!! ??? ...", configs);
    expect(result.persona).toBeNull();
  });

  it("matches dba-expert for SQL-related message", () => {
    const result = route("why is my postgres query so slow", configs);
    expect(result.persona).toBe("dba-expert");
    expect(result.score).toBeGreaterThanOrEqual(2);
    expect(result.method).toBe("auto");
  });

  it("matches security-auditor for security message", () => {
    const result = route("check for XSS vulnerability in this code", configs);
    expect(result.persona).toBe("security-auditor");
    expect(result.signals).toContain("xss");
  });

  it("matches contract-lawyer for legal message", () => {
    const result = route("review this NDA clause for liability", configs);
    expect(result.persona).toBe("contract-lawyer");
  });

  it("matches staff-engineer for architecture message", () => {
    const result = route("design a distributed architecture for this system", configs);
    expect(result.persona).toBe("staff-engineer");
  });

  // Override syntax
  it("handles @override syntax", () => {
    const result = route("@staff-engineer design this API", configs);
    expect(result.persona).toBe("staff-engineer");
    expect(result.method).toBe("override");
    expect(result.score).toBe(1);
    expect(result.signals).toEqual([]);
  });

  it("handles @override with non-existent persona", () => {
    const result = route("@nonexistent-persona do something", configs);
    expect(result.persona).toBe("nonexistent-persona");
    expect(result.method).toBe("override");
  });

  // Disabled personas
  it("never returns a disabled persona", () => {
    const result = route("sql query optimization help", configs);
    expect(result.persona).not.toBe("disabled-persona");
    expect(result.persona).toBe("dba-expert");
  });

  // Threshold
  it("respects threshold — high-threshold needs 3 signals", () => {
    const result = route("sql query", configs);
    // high-threshold needs 3 matches but only has 2
    // dba-expert should win since it has threshold: 1
    expect(result.persona).toBe("dba-expert");
  });

  it("high-threshold matches when all 3 signals present", () => {
    // Both dba-expert and high-threshold match, but dba-expert has more total signals matched
    const result = route("sql query postgres explain slow", configs);
    expect(result.persona).toBe("dba-expert");
    expect(result.score).toBeGreaterThanOrEqual(3);
  });

  // Case insensitivity
  it("matches signals case-insensitively", () => {
    const result = route("POSTGRES SQL QUERY", configs);
    expect(result.persona).toBe("dba-expert");
  });

  it("handles mixed case in message", () => {
    const result = route("Check for XSS and SQL Injection", configs);
    expect(result.persona).not.toBeNull();
  });

  // Tie-breaking
  it("breaks ties alphabetically when score and priority are equal", () => {
    const tiedConfigs: PersonaConfig[] = [
      { persona: "beta-persona", signals: ["test"], threshold: 1, priority: 0, disabled: false },
      { persona: "alpha-persona", signals: ["test"], threshold: 1, priority: 0, disabled: false },
    ];
    const result = route("this is a test", tiedConfigs);
    expect(result.persona).toBe("alpha-persona");
  });

  it("priority wins over alphabetical order", () => {
    const priorityConfigs: PersonaConfig[] = [
      { persona: "alpha-persona", signals: ["test"], threshold: 1, priority: 0, disabled: false },
      { persona: "beta-persona", signals: ["test"], threshold: 1, priority: 5, disabled: false },
    ];
    const result = route("this is a test", priorityConfigs);
    expect(result.persona).toBe("beta-persona");
  });

  it("score wins over priority", () => {
    const scoreConfigs: PersonaConfig[] = [
      { persona: "low-score", signals: ["test"], threshold: 1, priority: 10, disabled: false },
      { persona: "high-score", signals: ["test", "bug", "coverage"], threshold: 1, priority: 0, disabled: false },
    ];
    const result = route("test the bug coverage", scoreConfigs);
    expect(result.persona).toBe("high-score");
  });

  // Signal counting
  it("counts duplicate signal in message as 1 match", () => {
    const result = route("sql sql sql sql sql", configs);
    expect(result.persona).toBe("dba-expert");
    expect(result.score).toBe(1); // "sql" counted once
  });

  it("returns no match when no signals found", () => {
    const result = route("hello how are you today", configs);
    expect(result.persona).toBeNull();
  });

  // Multi-word signals
  it("matches multi-word signals like 'system design'", () => {
    const result = route("help me with system design", configs);
    expect(result.persona).toBe("staff-engineer");
    expect(result.signals).toContain("system design");
  });

  // Empty configs
  it("returns null when configs array is empty", () => {
    const result = route("sql query help", []);
    expect(result.persona).toBeNull();
  });

  // Multiple personas matching
  it("returns highest scoring persona when multiple match", () => {
    const result = route("sql query postgres slow explain index join", configs);
    expect(result.persona).toBe("dba-expert");
    expect(result.score).toBeGreaterThanOrEqual(4);
  });
});

describe("routeAll", () => {
  it("returns all matching personas ranked by score", () => {
    const results = routeAll("sql injection vulnerability", configs);
    expect(results.length).toBeGreaterThanOrEqual(2);
    // First result should have highest score
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it("marks only the winning persona as wouldLoad", () => {
    const results = routeAll("sql query postgres", configs);
    const loaded = results.filter((r) => r.wouldLoad);
    expect(loaded.length).toBe(1);
  });

  it("returns empty array when no signals match", () => {
    const results = routeAll("hello world", configs);
    expect(results.length).toBe(0);
  });

  it("excludes disabled personas", () => {
    const results = routeAll("sql query", configs);
    const disabled = results.find((r) => r.persona === "disabled-persona");
    expect(disabled).toBeUndefined();
  });
});
