import test from "node:test";
import assert from "node:assert/strict";
import { matchElements } from "../src/matcher.js";

/** @type {import('../src/types.js').FigmaElement} */
const figma = (text, id = "1") => ({
  id,
  name: "Text",
  text,
  fontSize: 16,
  fontWeight: 400,
  color: "#000000",
  width: 100,
  height: 20,
  frameId: "frame",
});

/** @type {import('../src/types.js').DomElement} */
const dom = (text) => ({
  text,
  tag: "p",
  fontSize: 16,
  fontWeight: 400,
  color: "rgb(0, 0, 0)",
  width: 100,
  height: 20,
});

test("matchElements finds exact text match", () => {
  const pairs = matchElements([figma("Apply now")], [dom("Apply now")]);
  assert.equal(pairs[0].matchType, "exact");
  assert.equal(pairs[0].dom?.text, "Apply now");
});

test("matchElements finds fuzzy match when punctuation differs", () => {
  const pairs = matchElements([figma("Apply now!")], [dom("apply now")]);
  assert.equal(pairs[0].matchType, "fuzzy");
});

test("matchElements flags ambiguous duplicate text", () => {
  const pairs = matchElements(
    [figma("Apply now")],
    [dom("Apply now"), dom("Apply now")]
  );
  assert.equal(pairs[0].ambiguous, true);
  assert.equal(pairs[0].ambiguousCount, 2);
});

test("matchElements returns none when text missing", () => {
  const pairs = matchElements([figma("Missing copy")], [dom("Other text")]);
  assert.equal(pairs[0].matchType, "none");
  assert.equal(pairs[0].dom, null);
});
