import test from "node:test";
import assert from "node:assert/strict";
import { generateReviewMarkdown } from "../src/reviewBundle.js";

/** @type {import('../src/types.js').FigmaElement[]} */
const figmaElements = [
  {
    id: "1:1",
    name: "Title",
    text: "The Platinum Card",
    fontSize: 24,
    fontWeight: 700,
    color: "#006fcf",
    width: 400,
    height: 32,
    frameId: "frame",
    sectionPath: "Card / Hero / Title",
    roleHint: "hero",
  },
];

/** @type {import('../src/types.js').DomElement[]} */
const domElements = [
  {
    text: "The Platinum Card",
    tag: "h1",
    fontSize: 24,
    fontWeight: 700,
    color: "rgb(0, 111, 207)",
    width: 400,
    height: 32,
    selector: "h1",
    sectionContext: "main",
    nearestHeading: null,
  },
];

/** @type {import('../src/types.js').ValidationReport} */
const naiveFindings = {
  generatedAt: new Date().toISOString(),
  meta: {
    figmaLink: "https://figma.com/design/x",
    pageUrl: "https://example.com",
    fileKey: "x",
    nodeId: "1:1",
  },
  summary: { total: 1, pass: 1, warn: 0, fail: 0 },
  results: [],
};

test("generateReviewMarkdown with dom file includes naive findings references", () => {
  const md = generateReviewMarkdown({
    meta: {
      figmaLink: "https://figma.com/design/x",
      pageUrl: "https://example.com",
      fileKey: "x",
      nodeId: "1:1",
      frameWidth: 1440,
    },
    figmaElements,
    domElements,
    naiveFindings,
    bundleDir: "/tmp/bundle",
    hasDomFile: true,
  });

  assert.ok(md.includes("# Cardshop Validate — Agent Review Task"));
  assert.ok(md.includes("figma-snapshot.json"));
  assert.ok(md.includes("dom-snapshot.json"));
  assert.ok(md.includes("naive-findings.json"));
  assert.ok(md.includes("Match by role + meaning"));
  assert.ok(md.includes("[`hero`]"));
});

test("generateReviewMarkdown without dom file instructs Copilot fetch", () => {
  const md = generateReviewMarkdown({
    meta: {
      figmaLink: "https://figma.com/design/x",
      pageUrl: "https://example.com",
      fileKey: "x",
      nodeId: "1:1",
      frameWidth: 1440,
    },
    figmaElements,
    domElements: [],
    naiveFindings,
    bundleDir: "/tmp/bundle",
    hasDomFile: false,
  });

  assert.ok(md.includes("Copilot must fetch the page URL"));
  assert.ok(md.includes("fetch** tool"));
});
