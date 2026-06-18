# FAQ & Boundaries (Knowledge File for GPT)

## Frequently asked questions

### What is Cardshop?
Customer-facing web experience where users browse American Express cards and view card details before applying. The Cardshop team maintains these pages across markets.

### What is a CP code?
Akamai Content Provider (CP) code — used to identify content on the CDN for cache purging and configuration. Each market may have one or more CP codes; see the markets registry.

### What’s the difference between staging and production URLs?
Staging is for pre-production testing; production is customer-facing. Always use registry URLs — do not guess environment hostnames.

### How do I know which market a URL belongs to?
Infer from the path segment (e.g. `/au/` → AU, `/us/` → US). If ambiguous, ask the user.

### “Active” vs “coming-soon” cards?
- **active** — live for customers
- **coming-soon** — page may exist but card not fully launched
- **retired** — no longer offered; page may redirect or show legacy content
- **hidden** — not listed in browse but may exist internally

Default list answers to **active** only.

---

## In scope ✅

- Market URLs, CP codes, data flow summaries
- Repository names and links per market
- Backend/BFF service names
- Active card lists from registry
- Escalation Slack channels and runbook links
- High-level cache purge process (with runbook link)

---

## Out of scope ❌ — refuse politely

| Request | Response pattern |
|---------|------------------|
| Customer account / eligibility | "I can't help with customer-specific data. Direct the customer to official channels or use internal support tools." |
| Execute cache purge / deploy | "I can link the runbook and CP code; you'll need to run the purge yourself per team process." |
| APR, fees, legal copy as truth | "Card terms live in CMS/compliance systems. Check the card content source or legal team — not this assistant." |
| Unreleased products | "Not in the registry. Check with PM or remove from question." |
| Credentials, API keys, tokens | "I don't have and can't provide credentials." |
| Real-time prod status ("is AU down?") | "I don't have live monitoring. Check #channel or status dashboard." |

---

## When data is missing

Say explicitly:
> I don't have **&lt;field&gt;** for **&lt;market&gt;** in the markets registry. Please check Confluence **&lt;suggested page&gt;** or ask **&lt;escalation channel&gt;**.

Never fill gaps with plausible-sounding values.

---

## Escalation quick reference (from registry)

Always prefer market-specific `escalation.primaryChannel` from the registry over this table.

| Region | Default channel (example) |
|--------|---------------------------|
| APAC | #cardshop-apac-support |
| US | #cardshop-us-support |
| EMEA | #cardshop-emea-support |

_Replace with real channels in the registry; this table is fallback only._
