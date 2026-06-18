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

test("generateReviewMarkdown includes task rules and data file references", () => {
  const md = generateReviewMarkdown({
    meta: {
      figmaLink: "https://figma.com/design/x",
      pageUrl: "https://example.com",
      fileKey: "x",
      nodeId: "1:1",
      viewportWidth: 1440,
    },
    figmaElements,
    domElements,
    naiveFindings,
    bundleDir: "/tmp/bundle",
  });

  assert.ok(md.includes("# Cardshop Validate — Agent Review Task"));
  assert.ok(md.includes("figma-snapshot.json"));
  assert.ok(md.includes("dom-snapshot.json"));
  assert.ok(md.includes("naive-findings.json"));
  assert.ok(md.includes("Match by role + meaning"));
  assert.ok(md.includes("Confirmed bugs"));
  assert.ok(md.includes("[`hero`]"));
  assert.ok(md.includes("The Platinum Card"));
});
