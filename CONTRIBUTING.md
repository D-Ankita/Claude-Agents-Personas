# Contributing to claude-agent-personas

Thanks for wanting to contribute! The most impactful thing you can do is **add a new expert persona** — no TypeScript knowledge needed, just Markdown.

---

## Ways to Contribute

- **Add a persona** — the most needed contribution, zero code required
- **Improve an existing persona** — better signals, deeper expertise, cleaner approach
- **Fix a bug** — CLI commands, installer logic, router edge cases
- **Improve tests** — more edge cases in `router.test.ts`

---

## Adding a Persona (No Code Required)

### Step 1 — Copy the template

```bash
cp personas/_template.md personas/<category>/your-persona-name.md
```

Categories under `engineering/`: `frontend/`, `backend/`, `database/`, `qa/`, `devops/`, `data-ml/`, `mobile/`, `security/`
Other top-level categories: `business/`, `creative-data/`

Use kebab-case for the filename. Examples: `principal-blockchain-engineer.md`, `principal-svelte-developer.md`

---

### Step 2 — Fill in the 5 required sections

Every persona must have all 5 sections. See `personas/_template.md` for the exact format.

```markdown
---
name: Your Persona Name
version: 1.0.0
author: your-github-handle
signals: [keyword1, keyword2, keyword3]
---

## Identity
Who this expert is. Be specific — years of experience, what they've actually built/done.
Not "you are an expert in X." More like "you are a senior X with 10+ years who has done Y and Z."

## Mindset
How they think. What they prioritize. What they believe strongly.
This shapes the reasoning, not just the output.

## Communication Style
How they communicate. Bullet points with concrete examples.
"Show X before explaining Y" — give Claude formatting instructions here.

## Expertise
Specific tools, frameworks, methodologies they know deeply.
Use real names — not "databases" but "PostgreSQL, MySQL, Redis".

## Approach
Step-by-step how they tackle the user's type of problem.
Numbered list, 4-6 steps. Concrete and actionable.
```

---

### Step 3 — Add signals to router-config.yml

Open `personas/router-config.yml` and add an entry under the appropriate category:

```yaml
- id: principal-your-persona-name
  path: <category>/principal-your-persona-name.md
  signals:
    - keyword1
    - keyword2
    - keyword3
```

**Signal tips:**
- Use domain-specific words that users would naturally type
- Aim for 8-12 signals minimum
- All lowercase
- Single words work best; short phrases (2 words) are okay
- Avoid generic words like "help", "use", "make" — too many false positives

---

### Step 4 — Lint your persona

```bash
npx claude-agent-personas lint personas/<category>/your-persona-name.md
```

The linter checks:
- All 5 sections present
- Frontmatter has name, version, author, signals
- At least 3 signals defined
- Token count shown — keep under 500 (warning at 500, hard warning at 800)

Fix any errors before opening a PR.

---

### Step 5 — Open a PR

```bash
git checkout -b persona/your-persona-name
git add personas/<category>/your-persona-name.md personas/router-config.yml
git commit -m "feat: add your-persona-name persona"
git push origin persona/your-persona-name
```

Then open a PR with:
- **Title:** `feat: add <persona-name> persona`
- **Description:** 2-3 sentences on what domain this covers and why it's useful

---

## PR Checklist

Before submitting, confirm:

- [ ] Persona file is in the right category folder
- [ ] All 5 sections present (Identity, Mindset, Communication Style, Expertise, Approach)
- [ ] Frontmatter has `name`, `version`, `author`, `signals`
- [ ] At least 3 signals defined
- [ ] Token count is under 500 (run `npx claude-agent-personas lint` to check)
- [ ] Entry added to `router-config.yml`
- [ ] Signals don't duplicate existing ones unnecessarily
- [ ] `npx claude-agent-personas lint` passes with no errors

---

## Working on the CLI

If you're contributing to the TypeScript source:

```bash
git clone https://github.com/D-Ankita/claude-agent-personas.git
cd claude-agent-personas
npm install
npm run build
npm test
```

Run tests:
```bash
npm test           # run once
npm run test:watch # watch mode
```

Run CLI locally:
```bash
npm run dev -- init --dry-run
npm run dev -- debug "why is my postgres query slow"
npm run dev -- list
```

---

## Code Style

- TypeScript strict mode — no `any`
- Pure functions where possible — especially in `router.ts`
- Every new command needs at least basic tests
- Keep CLI output readable — use `chalk` for colour, `ora` for spinners

---

## Questions?

Open an issue — happy to help you get a PR across the line.
