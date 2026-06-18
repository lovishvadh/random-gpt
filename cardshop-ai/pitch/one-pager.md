# Cardshop AI: 3 Foundations → 4 Capabilities

**Owner:** _<your name>_ · **Team:** Cardshop · **Status:** Proposal · **Date:** 2026-06-19

## TL;DR
We can introduce AI across Cardshop acquisition, quality, and developer productivity **without MCP** and **without sending sensitive data to public AI tools**. The trick: most of the value is *deterministic tooling with AI on top*. If we build **3 reusable foundations first**, we unlock **4 capabilities** at a fraction of the per-feature cost — and avoid the #1 failure mode (a confident GPT giving stale or wrong operational answers).

---

## The problem we keep hitting
- New devs spend days learning per-market plumbing (repos, backends, CP codes, cache, escalation).
- Many near-identical card pages across markets → high effort, drift between Figma/CMS/live site, and compliance risk (stale APR/benefits).
- Figma → code handoff is manual and inconsistent.

## The bet: foundations, not point tools
Pitched as four separate AI tools, this looks like four risky bets. It's actually **three shared foundations** that multiple capabilities reuse.

### 3 Foundations (build once)
1. **Markets Registry** — machine-readable source of truth (CP codes, URLs, active cards, data flow, escalation) kept current via PR/CI. _AI reads it; never memorizes it._
2. **AQX Component Catalog** — machine-readable component contract (props, allowed values, a11y, examples) ideally auto-extracted from source.
3. **Figma Extraction + Naming Conventions** — a deterministic Figma REST → JSON engine, plus agreed component-naming discipline with design.

### 4 Capabilities (unlocked by the foundations)
| # | Capability | Leans on | Primary value |
|---|---|---|---|
| 1 | **Market Knowledge GPT** (cited answers on data flow, repos, CP codes, cache, escalation, active cards) | Registry + Confluence | Onboarding / ops speed |
| 2 | **Figma → Content JSON & → aqx composition** | Figma engine + Catalog | Dev productivity |
| 3 | **Drift Validator** (content + design mismatch: Figma vs live) | Figma engine + Registry | Quality / compliance |
| 4 | **Guided Page Generator** (step-by-step Q&A → aqx page draft) | All three | Acquisition velocity |

---

## Why this sequencing
```
Phase 0  Foundations      Markets Registry · Figma naming conventions · confirm approved LLM
Phase 1  Quick wins       #1 Knowledge GPT (cited) · #2a Figma → Content JSON
Phase 2  Reuse the engine #3 Content drift validator (nightly CI report) · AQX Catalog
Phase 3  Higher-order     #2b Figma → aqx · #3 design validation · #4 page generator
```
Each phase ships standalone value and de-risks the next.

## Guardrails (non-negotiable)
- **Approved enterprise LLM only.** No public ChatGPT/Custom GPT with internal data; no PII or unreleased products.
- **No MCP** → integration via batch sync / registry / direct Figma REST, not real-time cross-tool agents. Set expectations accordingly.
- **Human + compliance sign-off** for anything touching APR, fees, terms, eligibility, disclosures, or apply flows.
- **Citations required.** Operational answers (e.g., cache clearing) must link the source doc, never recite from memory.
- **Generators produce reviewable drafts**, never auto-merge/auto-publish.

## What we need
- Eng time for Phase 0–1 (foundations + first GPT).
- Design partnership on Figma naming conventions.
- Confirmation of the Amex-approved LLM instance + data-handling policy.
- A compliance partner for the review gates.

## Success metrics
- **Onboarding:** time-to-first-PR for new Cardshop devs ↓.
- **Productivity:** time to ship a new card page ↓; PR cycle time ↓.
- **Quality:** Figma/live drift defects caught pre-prod ↑; content/compliance escapes ↓.
- **Acquisition:** faster experiment turnaround on card pages (with experimentation team).

## Appendix — artifacts in repo
- `foundations/markets-registry.schema.json` + `markets-registry.example.yaml`
- `foundations/aqx-catalog.schema.json` + `aqx-catalog.example.yaml`
