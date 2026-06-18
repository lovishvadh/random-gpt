import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { comparePairs } from "../src/comparator.js";
import { scrapeDomElements } from "../src/domScraper.js";
import { matchElements } from "../src/matcher.js";
import { buildReport, renderHtmlReport } from "../src/reporter.js";
import { writeBundle } from "../src/reviewBundle.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureHtml = join(__dirname, "..", "fixtures", "sample-page.html");
const fixtureUrl = `file://${fixtureHtml}`;

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

test("integration: fixture page produces pass, warn, and fail in report", async () => {
  const domElements = await scrapeDomElements(fixtureUrl, { viewportWidth: 1440 });
  assert.ok(domElements.length >= 3);

  const pairs = matchElements(mockFigmaElements, domElements);
  const results = comparePairs(pairs);
  const report = buildReport(results, {
    figmaLink: "https://www.figma.com/design/fixture/Card?node-id=1-1",
    pageUrl: fixtureUrl,
    fileKey: "fixture",
    nodeId: "1:1",
  });

  assert.ok(report.summary.pass >= 1, "expected at least one pass");
  assert.ok(report.summary.fail >= 1, "expected at least one fail for missing Figma text");
  assert.equal(report.summary.total, mockFigmaElements.length);

  const outDir = join(__dirname, "..", "fixtures", "output");
  await mkdir(outDir, { recursive: true });

  const htmlPath = join(outDir, "report.html");
  const jsonPath = join(outDir, "report.json");

  await writeFile(htmlPath, renderHtmlReport(report), "utf8");
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf8");

  const json = JSON.parse(await readFile(jsonPath, "utf8"));
  assert.equal(json.summary.total, 4);
  assert.ok(json.results.some((r) => r.status === "fail"));
});

test("integration: bundle mode writes four valid artifacts", async () => {
  const domElements = await scrapeDomElements(fixtureUrl, { viewportWidth: 1440 });
  const pairs = matchElements(mockFigmaElements, domElements);
  const results = comparePairs(pairs);
  const report = buildReport(results, {
    figmaLink: "https://www.figma.com/design/fixture/Card?node-id=1-1",
    pageUrl: fixtureUrl,
    fileKey: "fixture",
    nodeId: "1:1",
  });

  const bundleDir = join(__dirname, "..", "fixtures", "output", "bundle");
  await mkdir(bundleDir, { recursive: true });

  const paths = await writeBundle(bundleDir, {
    meta: {
      figmaLink: "https://www.figma.com/design/fixture/Card?node-id=1-1",
      pageUrl: fixtureUrl,
      fileKey: "fixture",
      nodeId: "1:1",
      viewportWidth: 1440,
    },
    figmaElements: mockFigmaElements,
    domElements,
    naiveFindings: report,
    bundleDir,
  });

  const review = await readFile(paths.reviewPath, "utf8");
  const figmaJson = JSON.parse(await readFile(paths.figmaPath, "utf8"));
  const domJson = JSON.parse(await readFile(paths.domPath, "utf8"));
  const naiveJson = JSON.parse(await readFile(paths.naivePath, "utf8"));

  assert.ok(review.includes("Agent Review Task"));
  assert.equal(figmaJson.count, mockFigmaElements.length);
  assert.ok(domJson.count >= 3);
  assert.equal(naiveJson.summary.total, 4);
  assert.ok(domElements[0].selector);
  assert.ok(domElements[0].sectionContext);
});
