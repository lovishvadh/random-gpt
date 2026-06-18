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
 * @param {Record<string, string>} args
 */
export function parseArgs(args) {
  const result = {
    figma: "",
    token: process.env.FIGMA_TOKEN || "",
    url: "",
    waitSelector: "",
    viewportWidth: null,
    outDir: ".",
    mode: "report",
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
      case "--wait-selector":
        result.waitSelector = next || "";
        i++;
        break;
      case "--viewport-width":
        result.viewportWidth = Number(next);
        i++;
        break;
      case "--out":
        result.outDir = next || ".";
        i++;
        break;
      case "--mode":
        result.mode = next || "report";
        i++;
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
Cardshop Figma Validator — compare Figma design vs live page

Usage:
  node src/index.js --figma <FIGMA_LINK> --token <TOKEN> --url <PAGE_URL> [options]

Required:
  --figma <link>     Figma design URL with ?node-id=...
  --token <token>    Figma personal access token (or FIGMA_TOKEN env)
  --url <url>        Public page URL to validate

Options:
  --mode <report|bundle>  Output mode (default: report)
                          report = report.html + report.json
                          bundle = Copilot agent bundle (REVIEW.md + snapshots)
  --wait-selector <css>   Wait for selector before scraping
  --viewport-width <px>   Browser viewport width (default: 1440)
  --out <dir>             Output directory (default: .)
  -h, --help              Show this help

Examples:
  node src/index.js \\
    --figma "https://www.figma.com/design/abc/Card?node-id=1-2" \\
    --token "$FIGMA_TOKEN" \\
    --url "https://www.americanexpress.com/au/credit-cards/platinum-card"

  node src/index.js --mode bundle --out bundle \\
    --figma "..." --token "$FIGMA_TOKEN" --url "..."
`);
}
