import test from "node:test";
import assert from "node:assert/strict";
import { comparePairs } from "../src/comparator.js";

/** @type {import('../src/types.js').FigmaElement} */
const baseFigma = {
  id: "1",
  name: "Headline",
  text: "The Platinum Card",
  fontSize: 24,
  fontWeight: 700,
  color: "#006fcf",
  width: 400,
  height: 32,
  frameId: "frame",
};

/** @type {import('../src/types.js').DomElement} */
const baseDom = {
  text: "The Platinum Card",
  tag: "h1",
  fontSize: 24,
  fontWeight: 700,
  color: "rgb(0, 111, 207)",
  width: 400,
  height: 32,
};

test("comparePairs passes when content and design match", () => {
  const results = comparePairs([
    { figma: baseFigma, dom: baseDom, matchType: "exact", ambiguous: false },
  ]);
  assert.equal(results[0].status, "pass");
});

test("comparePairs fails when text missing on page", () => {
  const results = comparePairs([
    { figma: baseFigma, dom: null, matchType: "none", ambiguous: false },
  ]);
  assert.equal(results[0].status, "fail");
  assert.equal(results[0].issues[0].type, "missing-text");
});

test("comparePairs warns on font-size mismatch", () => {
  const results = comparePairs([
    {
      figma: baseFigma,
      dom: { ...baseDom, fontSize: 30 },
      matchType: "exact",
      ambiguous: false,
    },
  ]);
  assert.equal(results[0].status, "warn");
  assert.ok(results[0].issues.some((i) => i.type === "font-size"));
});

test("comparePairs warns on dimension mismatch but not fail", () => {
  const results = comparePairs([
    {
      figma: baseFigma,
      dom: { ...baseDom, width: 600 },
      matchType: "exact",
      ambiguous: false,
    },
  ]);
  assert.equal(results[0].status, "warn");
  assert.ok(results[0].issues.some((i) => i.type === "dimension"));
});
