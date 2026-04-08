# claude-agent-personas

> Claude Code that automatically thinks like the expert you need - no commands, no switching, no token waste.

[![npm version](https://img.shields.io/npm/v/claude-agent-personas.svg)](https://www.npmjs.com/package/claude-agent-personas)
[![npm downloads](https://img.shields.io/npm/dw/claude-agent-personas.svg)](https://www.npmjs.com/package/claude-agent-personas)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## The Problem

Most Claude Code power users put expert personas in their `CLAUDE.md`. Smart idea - except Claude Code **re-injects your entire CLAUDE.md on every single message turn**. Define 20 personas and you're burning ~5,000 tokens before you type a word.

| Setup | Tokens/turn | Monthly cost (est.) |
|-------|-------------|---------------------|
| Default Claude Code | ~200 | ~$2 |
| 20 personas in CLAUDE.md (naive) | ~5,000 | ~$60–120 |
| **claude-agent-personas** | ~350 | ~$4 |

**claude-agent-personas** solves this with intelligent lazy-loading and automatic persona detection. Zero commands to remember.

---

## Quick Start

**Install** - takes under 5 seconds:

```bash
npx claude-agent-personas init
```

Open Claude Code in any project and just type naturally - the right expert loads automatically:

- `"why is my postgres query slow?"` → PostgreSQL DBA
- `"review this indemnification clause"` → Contract Lawyer
- `"design a system for 10k concurrent users"` → Staff Engineer
- `"set up a CI/CD pipeline with GitHub Actions"` → DevOps Engineer

Your existing `CLAUDE.md` is never overwritten - it only appends a small router block.

---

## Commands

```bash
npx claude-agent-personas init                        # Install everything
npx claude-agent-personas init --profile engineering  # Install only engineering personas
npx claude-agent-personas init --profile business     # Install only business personas
npx claude-agent-personas update                      # Refresh personas from latest package
npx claude-agent-personas list                        # Show all installed personas
npx claude-agent-personas remove                      # Clean uninstall
npx claude-agent-personas add ./my-persona.md         # Add a custom persona
npx claude-agent-personas lint ./my-persona.md        # Validate a persona file
```

Short alias `persona` also works:

```bash
persona init
persona list
```

---

## Bundled Personas (72)

### Engineering (55)

#### General (3)
| Persona | Domain |
|---------|--------|
| Staff Engineer | Architecture, system design, distributed systems |
| API Designer | REST, GraphQL, OpenAPI, schema design |
| Code Reviewer | Code quality, refactoring, SOLID principles |

#### Frontend (8)
| Persona | Domain |
|---------|--------|
| React Developer | React, hooks, state management |
| Next.js Engineer | Next.js, SSR, app router |
| Vue Developer | Vue, Vuex, Pinia, Nuxt |
| Angular Developer | Angular, RxJS, NgRx |
| CSS Specialist | CSS, Sass, Tailwind, responsive design |
| Web Performance Engineer | Core Web Vitals, Lighthouse, optimization |
| Accessibility Engineer | WCAG, ARIA, screen readers |
| Design System Engineer | Storybook, design tokens, component libraries |

#### Backend (9)
| Persona | Domain |
|---------|--------|
| Python Developer | Django, Flask, FastAPI, SQLAlchemy |
| Node.js Developer | Express, NestJS, Fastify, Prisma |
| Java Developer | Spring Boot, Maven, Hibernate |
| Go Developer | Goroutines, Gin, Echo, GORM |
| Rust Developer | Tokio, Actix, Axum, ownership model |
| .NET Developer | ASP.NET, Entity Framework, Blazor |
| Ruby Developer | Rails, ActiveRecord, RSpec |
| PHP Developer | Laravel, Symfony, Eloquent |
| GraphQL Developer | Apollo, Hasura, federation |

#### Database (5)
| Persona | Domain |
|---------|--------|
| PostgreSQL DBA | Performance tuning, replication, indexing |
| MySQL DBA | InnoDB, replication, query optimization |
| MongoDB Developer | Aggregation pipelines, Atlas, sharding |
| Redis Engineer | Caching, pub/sub, streams, clustering |
| Database Architect | Data modeling, schema design, normalization |

#### Data & ML (8)
| Persona | Domain |
|---------|--------|
| Data Scientist | scikit-learn, pandas, statistical analysis |
| ML Engineer | PyTorch, TensorFlow, MLOps, model serving |
| LLM Engineer | RAG, prompt engineering, LangChain, embeddings |
| Data Engineer | ETL, Airflow, Kafka, data pipelines |
| dbt Analyst | dbt, analytics engineering, dimensional modeling |
| SQL Analyst | Query optimization, window functions, Snowflake |
| Spark Engineer | PySpark, Spark SQL, Databricks |
| Data Architect | Data mesh, governance, data catalog |

#### DevOps & Infrastructure (8)
| Persona | Domain |
|---------|--------|
| DevOps Engineer | CI/CD, GitHub Actions, Docker |
| Kubernetes Engineer | K8s, Helm, ArgoCD, Istio |
| Terraform Engineer | IaC, HCL, Terragrunt |
| AWS Architect | EC2, S3, Lambda, CloudFormation, CDK |
| GCP Engineer | GKE, Cloud Run, BigQuery |
| Azure Engineer | AKS, Azure Functions, Cosmos DB |
| Platform Engineer | Internal developer platforms, Backstage |
| SRE Engineer | SLOs, incident management, chaos engineering |

#### QA & Testing (7)
| Persona | Domain |
|---------|--------|
| Python QA Engineer | pytest, Selenium, Playwright |
| JavaScript QA Engineer | Jest, Cypress, Vitest, Testing Library |
| Java QA Engineer | JUnit, Mockito, TestContainers |
| Performance Tester | JMeter, Gatling, k6, load testing |
| Security Tester | Pen testing, OWASP ZAP, Burp Suite |
| Mobile QA Engineer | Appium, XCUITest, Espresso |
| QA Architect | Test strategy, test pyramid, quality gates |

#### Mobile (4)
| Persona | Domain |
|---------|--------|
| iOS Developer | Swift, SwiftUI, UIKit, Xcode |
| Android Developer | Kotlin, Jetpack Compose, Room |
| React Native Developer | Expo, React Navigation, Hermes |
| Flutter Developer | Dart, Bloc, Riverpod |

#### Security (3)
| Persona | Domain |
|---------|--------|
| AppSec Engineer | OWASP, XSS, CSRF, security code review |
| Cloud Security Engineer | IAM, CSPM, zero trust |
| Security Architect | Threat modeling, NIST CSF, defense in depth |

### Business & Strategy (11)
| Persona | Domain |
|---------|--------|
| Contract Lawyer | Contracts, NDAs, liability, terms |
| CFO Advisor | Runway, cap table, fundraising, ARR/MRR |
| Growth Marketer | GTM, funnels, conversion, CAC/LTV |
| Product Manager | PRDs, user stories, OKRs, roadmaps |
| Copywriter | Landing pages, email copy, CTAs |
| Startup Advisor | Pitch decks, investors, MVPs, market sizing |
| Engineering Manager | 1:1s, hiring, performance reviews, team building |
| Agile Coach | Scrum, Kanban, retrospectives, ceremonies |
| Solutions Architect | RFPs, vendor evaluation, POCs, integrations |
| Business Analyst | BRDs, requirements, process mapping, gap analysis |
| Developer Advocate | DevRel, API docs, tutorials, developer experience |

### Creative & Data (6)
| Persona | Domain |
|---------|--------|
| Data Scientist | pandas, ML models, feature engineering |
| Technical Writer | Documentation, guides, tutorials |
| UX Researcher | User research, usability, journey mapping |
| SEO Specialist | Keywords, rankings, backlinks, SERP |
| Financial Analyst | DCF, NPV, forecasting, P&L modeling |
| Career Coach | Resume, interviews, salary negotiation |

---

## Add Your Own Persona

Create a custom persona in under 10 minutes:

```bash
# Copy template
cp ~/.claude/personas/_template.md ~/.claude/personas/my-expert.md

# Edit it, then validate
npx claude-agent-personas lint ~/.claude/personas/my-expert.md
```

Token budget: keep personas under **500 tokens**. The linter will warn you if you go over.

---

## Contributing

Want to add your persona to the official library? See [CONTRIBUTING.md](./CONTRIBUTING.md).

PRs welcome - the more domain experts in the library, the better it gets for everyone.

---

## License

MIT © [D-Ankita](https://github.com/D-Ankita)
