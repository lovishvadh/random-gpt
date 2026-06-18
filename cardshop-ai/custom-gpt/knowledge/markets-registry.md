# Cardshop Markets Registry (Knowledge File for GPT)

> **Purpose:** Authoritative fact layer for the Market Knowledge GPT.  
> **Maintenance:** Regenerate from `foundations/markets-registry.yaml` on every registry PR.  
> **Last updated:** 2026-06-19

---

## How to read this file

- Each `## Market: XX` section is self-contained.
- Fields map 1:1 to the YAML registry.
- The GPT must cite `markets-registry: <CODE> — <field>` when answering.

---

## Market: AU

| Field | Value |
|-------|-------|
| **Code** | AU |
| **Name** | Australia |
| **Status** | live |
| **CP Code** | 123456 |
| **Production URL** | https://www.americanexpress.com/au |
| **Staging URL** | https://stage.americanexpress.com/au |
| **Cardshop base path** | /credit-cards |

### Data flow (AU)

```
AEM (aem-apac) -> cardshop-bff-apac -> cardshop-web (SSR) -> Akamai edge cache
```

| Backend field | Value |
|---------------|-------|
| BFF service | cardshop-bff-apac |
| Content source | aem-apac |

### Repositories (AU)

| Name | Layer | URL |
|------|-------|-----|
| cardshop-web | frontend | https://github.example.com/cardshop/cardshop-web |
| cardshop-bff-apac | bff | https://github.example.com/cardshop/cardshop-bff-apac |
| cardshop-content-apac | content | https://github.example.com/cardshop/cardshop-content-apac |

### Escalation (AU)

| Field | Value |
|-------|-------|
| Primary channel | #cardshop-apac-support |
| On-call | PagerDuty: cardshop-apac |
| Runbook | https://confluence.example.com/cardshop/apac-runbook |

### Operations / Akamai (AU)

| Field | Value |
|-------|-------|
| CP code for purge | 123456 |
| Cache clear runbook | https://confluence.example.com/cardshop/akamai-purge |

### Active cards (AU)

Only `status: active` unless user asks otherwise.

| ID | Name | Status | Type | Page URL |
|----|------|--------|------|----------|
| AU-PLAT-CHARGE | The Platinum Card | active | charge | https://www.americanexpress.com/au/credit-cards/platinum-card |
| AU-EXPLORER | Explorer Credit Card | active | credit | https://www.americanexpress.com/au/credit-cards/explorer |

### Other cards (AU) — not active

| ID | Name | Status | Page URL |
|----|------|--------|----------|
| AU-QANTAS-ULTIMATE | Qantas Ultimate Card | coming-soon | https://www.americanexpress.com/au/credit-cards/qantas-ultimate |

---

## Market: US

> **Status:** PLACEHOLDER — replace with real data before upload.

| Field | Value |
|-------|-------|
| **Code** | US |
| **Name** | United States |
| **Status** | live |
| **CP Code** | _TBD_ |

_Add US section using the same structure as AU._

---

## Global notes

- **Cardshop** = customer-facing pages to browse cards and view card details.
- **CP code** = Akamai Content Provider code used for cache purging and CDN config.
- **active** = card page is live for customers in that market.
- If a market section is missing or marked TBD, the GPT must not invent values.
