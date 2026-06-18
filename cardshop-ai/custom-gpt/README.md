# Cardshop Market Knowledge GPT — Build Guide

This is the step-by-step guide for capability **#1**: a custom GPT that answers Cardshop market questions with **citations**, not guesses.

## What this GPT is (and is not)

| It IS | It is NOT |
|-------|-----------|
| An onboarding + ops assistant for Cardshop devs | A tool that clears Akamai cache or deploys code |
| A cited lookup over a **markets registry** + Confluence runbooks | A replacement for Confluence, JIRA, or on-call |
| A way to get the *right doc / channel / repo* fast | A live dashboard of production state |

**Core principle:** structured facts live in the **markets registry**; procedural/how-to content lives in **Confluence**; the GPT **routes** questions to the right source and **always cites**.

---

## Architecture

```text
User question
     │
     ▼
┌─────────────────────────────────────┐
│  Custom GPT (enterprise instance)   │
│  - Instructions (routing + rules)   │
│  - Knowledge files (uploaded)         │
└─────────────────────────────────────┘
     │
     ├── FACT questions ──────► markets-registry.md (from YAML)
     │                          "What is AU's CP code?"
     │                          "What cards are active in AU?"
     │
     └── HOW-TO questions ────► Confluence exports (runbooks)
                                "How do I clear Akamai cache?"
                                → summarize + link runbook, don't invent steps
```

### Two question types — two sources

| Type | Examples | Source | Answer style |
|------|----------|--------|--------------|
| **Facts** | URL, CP code, repos, backend, data flow, active cards, escalation channel | Markets registry | Direct lookup + cite `markets-registry` |
| **Procedures** | Cache purge steps, incident response, release process | Confluence runbooks | Short summary + **link to full runbook** |

Never let the GPT answer procedure questions from memory alone.

---

## Build checklist (in order)

### Step 0 — Get approval (do this first)
- [ ] Confirm Amex-approved GPT / Copilot / enterprise ChatGPT instance
- [ ] Confirm you may upload: markets registry (no secrets), Confluence exports (sanitized)
- [ ] Confirm **no** customer PII, unreleased products, or credentials in knowledge files

### Step 1 — Create the markets registry (real data)
- [ ] Start from `foundations/markets-registry.example.yaml`
- [ ] Fill in **one market** end-to-end (e.g. AU) with real values
- [ ] Add remaining markets incrementally
- [ ] Set up PR + owner so `activeCards` and `status` stay current

### Step 2 — Generate GPT-friendly knowledge files
- [ ] Run or copy from `knowledge/markets-registry.md` (human-readable export)
- [ ] Export 5–10 Confluence pages as PDF or Markdown (see `knowledge/confluence-index.md`)
- [ ] Add `knowledge/faq-and-boundaries.md` (what the GPT should refuse)

### Step 3 — Configure the Custom GPT
- [ ] Paste instructions from `instructions.md` into the GPT **Instructions** field
- [ ] Upload knowledge files (keep each file focused; see limits below)
- [ ] Set conversation starters (below)
- [ ] Disable web browsing unless explicitly approved for your use case

### Step 4 — Test with golden questions
- [ ] Run every question in `golden-questions.md`
- [ ] Fail = fix registry, re-export knowledge, or tighten instructions
- [ ] Pilot with 2–3 teammates for one week

### Step 5 — Maintain
- [ ] Registry updated via PR when markets/cards change
- [ ] Re-upload `markets-registry.md` after registry changes (or automate export in CI)
- [ ] Quarterly review of Confluence exports for stale runbooks

---

## Custom GPT configuration

### Name
`Cardshop Market Assistant` (or team naming convention)

### Description (short, shown in GPT picker)
Answers Cardshop questions about markets, repos, backends, CP codes, URLs, active cards, and escalation — with citations. Operational how-tos link to Confluence runbooks.

### Conversation starters
1. `What is the data flow for the AU market?`
2. `What cards are currently active in AU?`
3. `How do I clear Akamai cache for AU?`
4. `Which Slack channel do I use for an error on the AU Platinum page?`
5. `What repositories does the US market use?`

### Capabilities to enable/disable
| Capability | Recommendation |
|------------|----------------|
| **Web browsing** | Off (unless approved for public docs only) |
| **Code Interpreter** | Off (not needed) |
| **DALL·E** | Off |
| **Actions / APIs** | Off (no MCP; no live integrations in v1) |

### Knowledge file limits (practical)
- Keep **one** `markets-registry.md` — the GPT searches it well when structured with headers per market
- Split Confluence content by topic: `runbook-akamai.md`, `runbook-escalation.md`, `architecture-overview.md`
- Prefer **Markdown or PDF** exports over huge Word docs
- Target **< 20 files**, each **< 500KB** where possible; quality > quantity

---

## If public Custom GPT is not allowed

Use the same assets in your **approved** alternative:

| Platform | How |
|----------|-----|
| **Microsoft Copilot (M365)** | Ground on SharePoint/Confluence connector + upload registry to team site |
| **GitHub Copilot Chat** | `@workspace` over repo containing `markets-registry.yaml` + runbooks |
| **Internal GPT studio** | Same instructions + RAG over indexed Confluence + registry blob |

The **instructions** and **knowledge structure** stay identical; only the hosting changes.

---

## Success criteria (v1)

- [ ] 90%+ pass rate on `golden-questions.md` without hallucination
- [ ] Every answer includes a **source** (registry section or Confluence page title + link)
- [ ] GPT says "I don't know" when data is missing — never invents CP codes or channels
- [ ] New dev can answer 5 common onboarding questions in < 5 minutes using the GPT

---

## Files in this folder

| File | Purpose |
|------|---------|
| `instructions.md` | Paste into Custom GPT Instructions |
| `knowledge/markets-registry.md` | Upload — fact layer (example from AU) |
| `knowledge/confluence-index.md` | Index of runbooks to export and upload |
| `knowledge/faq-and-boundaries.md` | Upload — refusals and edge cases |
| `golden-questions.md` | Test suite before launch |
