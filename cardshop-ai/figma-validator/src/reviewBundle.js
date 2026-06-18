import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { writeSnapshots } from "./snapshot.js";
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
  } = input;

  const failItems = naiveFindings.results.filter((r) => r.status === "fail");
  const warnItems = naiveFindings.results.filter((r) => r.status === "warn");
  const passItems = naiveFindings.results.filter((r) => r.status === "pass");

  const strictFigma = figmaElements.filter((el) =>
    isStrictContent(el.text, el.roleHint)
  );

  const figmaPreview = figmaElements.slice(0, 8).map(formatFigmaLine).join("\n");
  const domPreview = domElements.slice(0, 8).map(formatDomLine).join("\n");
  const failPreview = failItems.slice(0, 5).map(formatNaiveLine).join("\n");
  const warnPreview = warnItems.slice(0, 5).map(formatNaiveLine).join("\n");

  return `# Cardshop Validate — Agent Review Task

> Generated: ${new Date().toISOString()}
> **Your job:** Perform semantic matching and triage. The naive findings below are hints only — layouts may differ.

## Inputs

| Field | Value |
|-------|-------|
| Figma link | ${meta.figmaLink} |
| Page URL | ${meta.pageUrl} |
| Figma file | \`${meta.fileKey}\` |
| Figma node | \`${meta.nodeId}\` |
| Viewport | ${meta.viewportWidth}px |
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
   - Example: Figma \`hero\` headline may map to an \`h1\` inside \`main\`, even if layout differs.

2. **Classify each matched or unmatched item:**
   - \`bug\` — real content or compliance issue (missing CTA, wrong benefit, wrong disclosure)
   - \`acceptable-drift\` — layout/responsive/style difference only; copy and intent match
   - \`needs-human\` — unclear; escalate (ambiguous duplicates, partial semantic match)

3. **STRICT content** (always \`bug\` if mismatched or missing):
   - Any node with \`roleHint: disclosure\`
   - Text mentioning APR, fees, terms, disclosures
   - Legal / fine print blocks

4. **Do NOT treat naive findings as truth:**
   - \`missing-text\` FAIL may be a false alarm if copy exists under different wording
   - \`dimension\` WARN is usually \`acceptable-drift\`
   - \`font-size\` / \`color\` WARN may be \`acceptable-drift\` if hierarchy is correct

5. **If a repo path was provided**, inspect CMS/content/components to explain root cause.

## Required output format

Reply with these sections:

### Confirmed bugs
- [ ] Item — reason — Figma ref — Page ref

### Acceptable drift (ignored)
- Item — why it is acceptable

### Needs human review
- Item — why uncertain

### Optional: JIRA draft
- Title, description, steps to reproduce, market/page URL

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

Read \`figma-snapshot.json\` and \`dom-snapshot.json\` for the full dataset.
`;
}

/**
 * @param {string} outDir
 * @param {import('./types.js').ReviewBundleInput} input
 */
export async function writeBundle(outDir, input) {
  const snapshotPaths = await writeSnapshots(
    outDir,
    input.figmaElements,
    input.domElements,
    input.meta
  );

  const naivePath = join(outDir, "naive-findings.json");
  await writeFile(
    naivePath,
    JSON.stringify(input.naiveFindings, null, 2),
    "utf8"
  );

  const reviewMd = generateReviewMarkdown({
    ...input,
    bundleDir: outDir,
  });
  const reviewPath = join(outDir, "REVIEW.md");
  await writeFile(reviewPath, reviewMd, "utf8");

  return {
    ...snapshotPaths,
    naivePath,
    reviewPath,
  };
}

/** @param {import('./types.js').FigmaElement} el */
function formatFigmaLine(el) {
  return `- [\`${el.roleHint}\`] **${el.sectionPath}** — "${truncate(el.text, 60)}"`;
}

/** @param {import('./types.js').DomElement} el */
function formatDomLine(el) {
  return `- \`<${el.tag}>\` **${el.sectionContext || "unknown"}** — "${truncate(el.text, 60)}" (\`${el.selector}\`)`;
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
