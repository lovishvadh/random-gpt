/**
 * Normalize text for fuzzy matching: lowercase, collapse whitespace, strip punctuation.
 * @param {string} text
 */
export function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "")
    .trim();
}

/**
 * @param {string} text
 */
export function isMeaningfulText(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.length < 2) return false;
  return true;
}

/**
 * @param {string[]} args
 */
export function parseArgs(args) {
  const result = {
    figma: "",
    token: process.env.FIGMA_TOKEN || "",
    url: "",
    domFile: "",
    outDir: ".",
    report: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case "--figma":
        result.figma = next || "";
        i++;
        break;
      case "--token":
        result.token = next || "";
        i++;
        break;
      case "--url":
        result.url = next || "";
        i++;
        break;
      case "--dom-file":
        result.domFile = next || "";
        i++;
        break;
      case "--out":
        result.outDir = next || ".";
        i++;
        break;
      case "--report":
        result.report = true;
        break;
      case "--help":
      case "-h":
        result.help = true;
        break;
      default:
        break;
    }
  }

  return result;
}

export function printHelp() {
  console.log(`
Cardshop Figma Validator — Copilot-driven (no browser dependencies)

Usage:
  node src/index.js --figma <FIGMA_LINK> --token <TOKEN> --url <PAGE_URL> [options]

Required:
  --figma <link>     Figma design URL with ?node-id=...
  --token <token>    Figma personal access token (or FIGMA_TOKEN env)
  --url <url>        Live page URL (Copilot fetches this; used in bundle metadata)

Options:
  --dom-file <path>  Optional dom-snapshot.json from DevTools extract
  --report           Also write report.html + report.json (requires --dom-file)
  --out <dir>        Output directory (default: .)
  -h, --help         Show this help

Copilot workflow (recommended):
  1. Run this CLI to extract Figma data → bundle/figma-snapshot.json + REVIEW.md
  2. Copilot fetches the page URL itself OR you provide --dom-file
  3. Copilot reads REVIEW.md and produces semantic verdict

Examples:
  node src/index.js \\
    --figma "https://www.figma.com/design/abc/Card?node-id=1-2" \\
    --token "$FIGMA_TOKEN" \\
    --url "https://www.example.com/card-page" \\
    --out bundle

  node src/index.js \\
    --figma "..." --token "$FIGMA_TOKEN" --url "..." \\
    --dom-file dom-snapshot.json --out bundle --report
`);
}
