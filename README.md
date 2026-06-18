# Cardshop AI

Tools and workflows for the American Express Cardshop team.

## Contents

| Path | Description |
|------|-------------|
| [`cardshop-ai/custom-gpt/`](cardshop-ai/custom-gpt/) | Cardshop Market Guide — Custom GPT knowledge, instructions, golden questions |
| [`cardshop-ai/figma-validator/`](cardshop-ai/figma-validator/) | Figma vs live page validator (CLI + Copilot agent bundle mode) |
| [`cardshop-ai/foundations/`](cardshop-ai/foundations/) | Markets registry and aqx catalog schemas |
| [`cardshop-ai/pitch/`](cardshop-ai/pitch/) | One-pager pitch (3 foundations → 4 capabilities) |

## Quick start — Figma validator (Copilot agent)

```bash
cd cardshop-ai/figma-validator
npm install
npx playwright install chromium
export FIGMA_TOKEN="your_token"

# Copilot runs this in agent mode, or run manually:
node src/index.js --mode bundle \
  --figma "<FIGMA_LINK>" \
  --url "<PAGE_URL>" \
  --out bundle
```

See [`cardshop-ai/figma-validator/README.md`](cardshop-ai/figma-validator/README.md) for full docs.

## Quick start — Market Guide GPT

See [`cardshop-ai/custom-gpt/README.md`](cardshop-ai/custom-gpt/README.md).
