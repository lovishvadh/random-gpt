import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { comparePairs } from "../src/comparator.js";
import { loadDomFile } from "../src/loadDomFile.js";
import { matchElements } from "../src/matcher.js";
import { buildReport } from "../src/reporter.js";
import { writeBundle, generateReviewMarkdown } from "../src/reviewBundle.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sampleDomPath = join(__dirname, "..", "fixtures", "sample-dom.json");

/** @type {import('../src/types.js').FigmaElement[]} */
const mockFigmaElements = [
  {
    id: "1:1",
    name: "Headline",
    text: "The Platinum Card",
    fontSize: 24,
    fontWeight: 700,
    color: "#006fcf",
    width: 400,
    height: 32,
    frameId: "frame",
    sectionPath: "Card / Hero / Headline",
    roleHint: "hero",
  },
  {
    id: "1:2",
    name: "Benefit 1",
    text: "Earn rewards on every purchase",
    fontSize: 16,
    fontWeight: 400,
    color: "#333333",
    width: 320,
    height: 20,
    frameId: "frame",
    sectionPath: "Card / Benefits / Benefit 1",
    roleHint: "benefit",
  },
  {
    id: "1:3",
    name: "Benefit 2",
    text: "Airport lounge access included",
    fontSize: 16,
    fontWeight: 400,
    color: "#333333",
    width: 320,
    height: 20,
    frameId: "frame",
    sectionPath: "Card / Benefits / Benefit 2",
    roleHint: "benefit",
  },
  {
    id: "1:4",
    name: "Stale Figma copy",
    text: "This benefit was removed from the live page",
    fontSize: 16,
    fontWeight: 400,
    color: "#333333",
    width: 320,
    height: 20,
    frameId: "frame",
    sectionPath: "Card / Benefits / Stale",
    roleHint: "benefit",
  },
];

test("integration: dom-file bundle produces valid artifacts", async () => {
  const domElements = await loadDomFile(sampleDomPath);
  assert.ok(domElements.length >= 3);

  const pairs = matchElements(mockFigmaElements, domElements);
  const results = comparePairs(pairs);
  const report = buildReport(results, {
    figmaLink: "https://www.figma.com/design/fixture/Card?node-id=1-1",
    pageUrl: "https://example.com/card",
    fileKey: "fixture",
    nodeId: "1:1",
  });

  assert.ok(report.summary.pass >= 1);
  assert.ok(report.summary.fail >= 1);

  const bundleDir = join(__dirname, "..", "fixtures", "output", "bundle");
  await mkdir(bundleDir, { recursive: true });

  const paths = await writeBundle(bundleDir, {
    meta: {
      figmaLink: "https://www.figma.com/design/fixture/Card?node-id=1-1",
      pageUrl: "https://example.com/card",
      fileKey: "fixture",
      nodeId: "1:1",
      frameWidth: 1440,
    },
    figmaElements: mockFigmaElements,
    domElements,
    naiveFindings: report,
    bundleDir,
    hasDomFile: true,
  });

  const review = await readFile(paths.reviewPath, "utf8");
  const figmaJson = JSON.parse(await readFile(paths.figmaPath, "utf8"));
  const domJson = JSON.parse(await readFile(paths.domPath, "utf8"));
  const naiveJson = JSON.parse(await readFile(paths.naivePath, "utf8"));

  assert.ok(review.includes("dom-snapshot.json"));
  assert.ok(review.includes("naive-findings.json"));
  assert.equal(figmaJson.count, mockFigmaElements.length);
  assert.equal(domJson.count, domElements.length);
  assert.equal(naiveJson.summary.total, 4);
});

test("generateReviewMarkdown without dom file instructs Copilot to fetch page", () => {
  const md = generateReviewMarkdown({
    meta: {
      figmaLink: "https://figma.com/design/x",
      pageUrl: "https://example.com/card",
      fileKey: "x",
      nodeId: "1:1",
      frameWidth: 1440,
    },
    figmaElements: mockFigmaElements,
    domElements: [],
    naiveFindings: {
      generatedAt: new Date().toISOString(),
      meta: { figmaLink: "", pageUrl: "", fileKey: "", nodeId: "" },
      summary: { total: 0, pass: 0, warn: 0, fail: 0 },
      results: [],
    },
    bundleDir: "/tmp/bundle",
    hasDomFile: false,
  });

  assert.ok(md.includes("Copilot must fetch the page URL"));
  assert.ok(md.includes("fetch** tool"));
  assert.ok(md.includes("figma-snapshot.json"));
  assert.ok(!md.includes("naive-findings.json"));
});
