import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { writeDomSnapshot, writeFigmaSnapshot } from "./snapshot.js";
import { isStrictContent } from "./utils/roleHint.js";

/**
 * @param {import('./types.js').ReviewBundleInput} input
 */
export function generateReviewMarkdown(input) {
  const {
    meta,
    figmaElements,
    domElements,
    naiveFindings,
    bundleDir,
    hasDomFile,
  } = input;

  const strictFigma = figmaElements.filter((el) =>
    isStrictContent(el.text, el.roleHint || "other")
  );

  const figmaPreview = figmaElements.slice(0, 8).map(formatFigmaLine).join("\n");

  if (!hasDomFile) {
    return generateCopilotFetchReview({
      meta,
      figmaElements,
      bundleDir,
      strictFigma,
      figmaPreview,
    });
  }

  const failItems = naiveFindings.results.filter((r) => r.status === "fail");
  const warnItems = naiveFindings.results.filter((r) => r.status === "warn");
  const passItems = naiveFindings.results.filter((r) => r.status === "pass");

  const domPreview = domElements.slice(0, 8).map(formatDomLine).join("\n");
  const failPreview = failItems.slice(0, 5).map(formatNaiveLine).join("\n");
  const warnPreview = warnItems.slice(0, 5).map(formatNaiveLine).join("\n");

  return `# Cardshop Validate — Agent Review Task

> Generated: ${new Date().toISOString()}
> **DOM source:** \`dom-snapshot.json\` (DevTools extract)
> **Your job:** Perform semantic matching and triage. Naive findings are hints only — layouts may differ.

## Inputs

| Field | Value |
|-------|-------|
| Figma link | ${meta.figmaLink} |
| Page URL | ${meta.pageUrl} |
| Figma file | \`${meta.fileKey}\` |
| Figma node | \`${meta.nodeId}\` |
| Figma frame width | ${meta.frameWidth ?? "unknown"}px |
| Bundle dir | \`${bundleDir}\` |

## Data files (read these)

| File | Contents |
|------|----------|
| \`figma-snapshot.json\` | ${figmaElements.length} Figma text nodes with \`sectionPath\`, \`roleHint\`, styles |
| \`dom-snapshot.json\` | ${domElements.length} live DOM text nodes with \`sectionContext\`, \`selector\`, styles |
| \`naive-findings.json\` | Baseline text-match comparison (may have false positives) |

## Counts

| Metric | Count |
|--------|-------|
| Figma text nodes | ${figmaElements.length} |
| DOM text nodes | ${domElements.length} |
| Naive FAIL | ${failItems.length} |
| Naive WARN | ${warnItems.length} |
| Naive PASS | ${passItems.length} |
| Strict/legal candidates (Figma) | ${strictFigma.length} |

## Reasoning rules (follow exactly)

1. **Match by role + meaning**, not pixel position or DOM order.
   - Use \`roleHint\` (Figma) and \`sectionContext\` / \`nearestHeading\` (DOM).

2. **Classify each matched or unmatched item:**
   - \`bug\` — real content or compliance issue
   - \`acceptable-drift\` — layout/responsive/style difference only
   - \`needs-human\` — unclear; escalate

3. **STRICT content** (always \`bug\` if mismatched or missing):
   - \`roleHint: disclosure\`, APR, fees, terms, legal copy

4. **Do NOT treat naive findings as truth:**
   - \`missing-text\` FAIL may be false alarm if copy exists under different wording
   - \`dimension\` / \`font-size\` / \`color\` WARN often = \`acceptable-drift\`

5. **If a repo path was provided**, inspect CMS/content/components for root cause.

## Required output format

### Confirmed bugs
- [ ] Item — reason — Figma ref — Page ref

### Acceptable drift (ignored)
- Item — why acceptable

### Needs human review
- Item — why uncertain

### Optional: JIRA draft
- Title, description, steps, page URL

---

## Preview: Figma nodes (first 8)

${figmaPreview || "_none_"}

## Preview: DOM nodes (first 8)

${domPreview || "_none_"}

## Preview: Naive FAIL (first 5)

${failPreview || "_none_"}

## Preview: Naive WARN (first 5)

${warnPreview || "_none_"}

---

Read \`figma-snapshot.json\`, \`dom-snapshot.json\`, and \`naive-findings.json\` for the full dataset.
`;
}

/**
 * @param {object} params
 */
function generateCopilotFetchReview(params) {
  const { meta, figmaElements, bundleDir, strictFigma, figmaPreview } = params;

  return `# Cardshop Validate — Agent Review Task

> Generated: ${new Date().toISOString()}
> **DOM source:** Copilot must fetch the page URL (no dom-snapshot.json provided)
> **Your job:** Fetch the live page, then semantically compare to Figma snapshot.

## Step 1 — Fetch the live page

Use your **fetch** tool to retrieve:

\`\`\`
${meta.pageUrl}
\`\`\`

Read the HTML content. Extract visible text (headings, paragraphs, buttons, links, list items).
Note: static fetch may miss JS-rendered content. If content seems incomplete, ask the user to run the DevTools extract script (\`scripts/extract-dom-console.js\`) and re-run with \`--dom-file\`.

## Step 2 — Read Figma snapshot

Open \`figma-snapshot.json\` in this bundle (${figmaElements.length} text nodes).

## Inputs

| Field | Value |
|-------|-------|
| Figma link | ${meta.figmaLink} |
| Page URL | ${meta.pageUrl} |
| Figma file | \`${meta.fileKey}\` |
| Figma node | \`${meta.nodeId}\` |
| Figma frame width | ${meta.frameWidth ?? "unknown"}px |
| Bundle dir | \`${bundleDir}\` |
| Strict/legal candidates (Figma) | ${strictFigma.length} |

## Reasoning rules (follow exactly)

1. **Match by role + meaning**, not pixel position.
   - Use Figma \`roleHint\` and \`sectionPath\` to identify hero, CTA, benefits, disclosures.

2. **Classify each item:**
   - \`bug\` — missing/wrong content or compliance issue
   - \`acceptable-drift\` — layout/responsive difference; copy intent matches
   - \`needs-human\` — unclear match

3. **STRICT content** (always \`bug\` if wrong/missing):
   - Disclosures, APR, fees, terms, legal copy, primary CTA

4. **Without computed styles**, focus on **content** comparison. Do not guess font sizes/colors.

5. **If a repo path was provided**, inspect CMS/content/components for root cause.

## Required output format

### Confirmed bugs
- [ ] Item — reason — Figma ref — Page ref

### Acceptable drift (ignored)
- Item — why acceptable

### Needs human review
- Item — why uncertain

### Optional: JIRA draft
- Title, description, steps, page URL

---

## Preview: Figma nodes (first 8)

${figmaPreview || "_none_"}

---

Read \`figma-snapshot.json\` for the full Figma dataset.
`;
}

/**
 * @param {string} outDir
 * @param {import('./types.js').ReviewBundleInput} input
 */
export async function writeBundle(outDir, input) {
  const figmaPath = await writeFigmaSnapshot(
    outDir,
    input.figmaElements,
    input.meta
  );

  /** @type {string | null} */
  let domPath = null;
  /** @type {string | null} */
  let naivePath = null;

  if (input.hasDomFile) {
    domPath = await writeDomSnapshot(outDir, input.domElements, input.meta);
    naivePath = join(outDir, "naive-findings.json");
    await writeFile(
      naivePath,
      JSON.stringify(input.naiveFindings, null, 2),
      "utf8"
    );
  }

  const reviewMd = generateReviewMarkdown({
    ...input,
    bundleDir: outDir,
  });
  const reviewPath = join(outDir, "REVIEW.md");
  await writeFile(reviewPath, reviewMd, "utf8");

  const metaPath = join(outDir, "meta.json");
  await writeFile(
    metaPath,
    JSON.stringify(
      {
        ...input.meta,
        hasDomFile: input.hasDomFile,
        figmaNodeCount: input.figmaElements.length,
        domNodeCount: input.hasDomFile ? input.domElements.length : 0,
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    ),
    "utf8"
  );

  return {
    figmaPath,
    domPath,
    naivePath,
    reviewPath,
    metaPath,
  };
}

/** @param {import('./types.js').FigmaElement} el */
function formatFigmaLine(el) {
  return `- [\`${el.roleHint || "other"}\`] **${el.sectionPath || el.name}** — "${truncate(el.text, 60)}"`;
}

/** @param {import('./types.js').DomElement} el */
function formatDomLine(el) {
  return `- \`<${el.tag}>\` **${el.sectionContext || "unknown"}** — "${truncate(el.text, 60)}" (\`${el.selector || "n/a"}\`)`;
}

/** @param {import('./types.js').ComparisonResult} r */
function formatNaiveLine(r) {
  return `- [${r.status}] "${truncate(r.figmaText, 50)}" → ${r.domText ? `"${truncate(r.domText, 40)}"` : "_missing_"}`;
}

/** @param {string} s @param {number} n */
function truncate(s, n) {
  if (!s) return "";
  return s.length <= n ? s : `${s.slice(0, n)}…`;
}
