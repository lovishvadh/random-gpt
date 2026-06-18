# Confluence Knowledge Index (for GPT uploads)

Export each page below from Confluence as **PDF** or **Markdown** and upload alongside `markets-registry.md`. This index tells the GPT which file covers which topic.

| Topic | Confluence page title (example) | Upload as filename | Used for questions like |
|-------|------------------------------|--------------------|-------------------------|
| Akamai cache purge | Cardshop — Akamai Cache Purge Runbook | `runbook-akamai-purge.md` | How do I clear cache for AU? |
| APAC escalation | Cardshop APAC — Incident & Escalation | `runbook-escalation-apac.md` | Who do I contact for AU page errors? |
| Architecture overview | Cardshop — Platform Architecture | `architecture-overview.md` | How does Cardshop work end-to-end? |
| New card launch | Cardshop — New Card Page Launch Checklist | `runbook-card-launch.md` | What’s the process to launch a card in AU? |
| Environments | Cardshop — Environments & URLs | `environments.md` | What’s the staging URL for US? |
| Repository map | Cardshop — Repository Guide | `repositories.md` | Where does the frontend code live? |

## Export tips

1. **One topic per file** — easier for the GPT to cite the right source.
2. **Include the Confluence URL** at the top of each exported file:
   ```markdown
   # Cardshop — Akamai Cache Purge Runbook
   Source: https://confluence.example.com/display/CARDSHOP/Akamai+Purge
   Last reviewed: 2026-05-01
   ```
3. **Remove** embedded secrets (API tokens, internal hostnames if restricted).
4. **Prefer** procedures over architecture diagrams-only pages (add a short text summary if the page is mostly images).

## Linking registry ↔ runbooks

The markets registry should store **URLs** to these pages in:
- `operations.akamaiCacheClearRunbook`
- `escalation.runbookUrl`

The GPT uses the registry for the link, and the uploaded runbook for step detail.
