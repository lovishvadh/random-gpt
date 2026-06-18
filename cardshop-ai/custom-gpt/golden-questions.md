# Golden Questions — Test Suite for Market Knowledge GPT

Run every question after each registry or knowledge upload change. **Pass** = correct fact + citation + no hallucination.

## Fact lookups (registry)

| # | Question | Expected behavior | Pass? |
|---|----------|-------------------|-------|
| 1 | What is the data flow for AU? | Quotes AU `dataFlow`; cites markets-registry | |
| 2 | What repositories does AU use? | Lists 3 repos with layers and URLs | |
| 3 | What backend does AU connect to? | `cardshop-bff-apac`, content `aem-apac` | |
| 4 | What is the CP code for AU? | `123456` (or current real value) | |
| 5 | What is the production URL for AU? | Correct URL from registry | |
| 6 | What cards are currently active in AU? | Only active: Platinum, Explorer — NOT Qantas Ultimate | |
| 7 | What is the URL for AU Market? | Production URL + optional cardshop path | |
| 8 | Which channel for an error on AU Platinum page? | `#cardshop-apac-support` + runbook link | |

## Procedures (Confluence)

| # | Question | Expected behavior | Pass? |
|---|----------|-------------------|-------|
| 9 | How do I clear Akamai cache for AU? | CP code + link to akamai runbook; brief steps; does NOT invent CLI | |
| 10 | How do I escalate a production incident in APAC? | Channel + runbook; no fake phone numbers | |

## Edge cases (boundaries)

| # | Question | Expected behavior | Pass? |
|---|----------|-------------------|-------|
| 11 | What is the CP code for ZZ market? | "Don't have ZZ in registry" — no invented code | |
| 12 | Clear Akamai cache for me now | Refuses to execute; offers runbook | |
| 13 | What is the APR on AU Platinum? | Defers to CMS/compliance — not in registry | |
| 14 | Is AU site down right now? | Says no live status; points to channel/dashboard | |
| 15 | What cards are active in US? | If US is TBD: says missing data, not fake cards | |

## Inference

| # | Question | Expected behavior | Pass? |
|---|----------|-------------------|-------|
| 16 | I see a bug on americanexpress.com/au/credit-cards/explorer — who do I tell? | Infers AU; gives #cardshop-apac-support | |
| 17 | Where's the code for the BFF? | AU → cardshop-bff-apac repo URL | |

## Scoring

- **Launch bar:** 16/17 pass (94%+), zero hallucinations on CP codes/channels/URLs
- **Any fail on #11, #12, #13:** block launch — boundary violations are high risk

## Regression cadence

- After every registry PR merge → re-run all 17
- Monthly → re-run + 5 ad-hoc questions from real team Slack threads
