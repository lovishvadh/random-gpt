# Cardshop AI

Copilot-driven tools for the American Express Cardshop team. **No browser downloads required.**

## Contents

| Path | Description |
|------|-------------|
| [`cardshop-ai/custom-gpt/`](cardshop-ai/custom-gpt/) | Cardshop Market Guide — Custom GPT knowledge |
| [`cardshop-ai/figma-validator/`](cardshop-ai/figma-validator/) | Figma validator — Copilot-only (zero deps, no Playwright) |
| [`cardshop-ai/foundations/`](cardshop-ai/foundations/) | Markets registry and aqx catalog schemas |
| [`cardshop-ai/pitch/`](cardshop-ai/pitch/) | One-pager pitch |

## Quick start — Figma validator (Copilot)

1. Open repo in VS Code with GitHub Copilot
2. Select **Cardshop Validate** chat mode
3. Set `export FIGMA_TOKEN="your_token"`
4. Paste Figma link + page URL in Copilot chat
5. Copilot runs the CLI and produces a verdict

```bash
cd cardshop-ai/figma-validator
node src/index.js \
  --figma "<FIGMA_LINK>" \
  --token "$FIGMA_TOKEN" \
  --url "<PAGE_URL>" \
  --out bundle
```

See [`cardshop-ai/figma-validator/README.md`](cardshop-ai/figma-validator/README.md).

## Quick start — Market Guide GPT

See [`cardshop-ai/custom-gpt/README.md`](cardshop-ai/custom-gpt/README.md).
