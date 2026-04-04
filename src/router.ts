export interface RouteResult {
  persona: string | null;
  score: number;
  signals: string[];
  method: "auto" | "override";
}

export interface PersonaConfig {
  persona: string;
  signals: string[];
  threshold: number;
  priority: number;
  disabled: boolean;
}

/**
 * Pure routing function — no side effects, no file system access.
 * Detects domain signals in a message and returns the best matching persona.
 */
export function route(message: string, configs: PersonaConfig[]): RouteResult {
  if (!message || message.trim().length === 0) {
    return { persona: null, score: 0, signals: [], method: "auto" };
  }

  // Check for @override syntax
  const overrideMatch = message.match(/^@(\S+)/);
  if (overrideMatch) {
    return {
      persona: overrideMatch[1],
      score: 1,
      signals: [],
      method: "override",
    };
  }

  const lowerMessage = message.toLowerCase();

  const scored: Array<{ config: PersonaConfig; score: number; matched: string[] }> = [];

  for (const config of configs) {
    if (config.disabled) continue;

    const matched: string[] = [];
    for (const signal of config.signals) {
      if (lowerMessage.includes(signal.toLowerCase())) {
        if (!matched.includes(signal)) {
          matched.push(signal);
        }
      }
    }

    if (matched.length >= config.threshold) {
      scored.push({ config, score: matched.length, matched });
    }
  }

  if (scored.length === 0) {
    return { persona: null, score: 0, signals: [], method: "auto" };
  }

  // Sort: score desc, priority desc, alphabetical asc (deterministic tie-break)
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.config.priority !== a.config.priority) return b.config.priority - a.config.priority;
    return a.config.persona.localeCompare(b.config.persona);
  });

  const winner = scored[0];
  return {
    persona: winner.config.persona,
    score: winner.score,
    signals: winner.matched,
    method: "auto",
  };
}

/**
 * Score all personas against a message — used by the debug command.
 */
export function routeAll(message: string, configs: PersonaConfig[]): Array<{
  persona: string;
  score: number;
  signals: string[];
  wouldLoad: boolean;
}> {
  const lowerMessage = message.toLowerCase();
  const winner = route(message, configs);

  return configs
    .filter((c) => !c.disabled)
    .map((config) => {
      const matched: string[] = [];
      for (const signal of config.signals) {
        if (lowerMessage.includes(signal.toLowerCase()) && !matched.includes(signal)) {
          matched.push(signal);
        }
      }
      return {
        persona: config.persona,
        score: matched.length,
        signals: matched,
        wouldLoad: config.persona === winner.persona,
      };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
