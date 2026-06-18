import test from "node:test";
import assert from "node:assert/strict";
import {
  buildSectionPath,
  deriveRoleFromAncestry,
  deriveRoleHint,
  isStrictContent,
} from "../src/utils/roleHint.js";

test("deriveRoleHint detects hero from frame name", () => {
  assert.equal(deriveRoleHint("Card / Hero"), "hero");
  assert.equal(deriveRoleHint("Page Headline"), "hero");
});

test("deriveRoleHint detects disclosure and cta", () => {
  assert.equal(deriveRoleHint("Legal Disclosure"), "disclosure");
  assert.equal(deriveRoleHint("Apply CTA Button"), "cta");
  assert.equal(deriveRoleHint("Benefits List"), "benefit");
});

test("deriveRoleFromAncestry uses deepest matching frame", () => {
  assert.equal(
    deriveRoleFromAncestry(["Card", "Hero", "Title"]),
    "hero"
  );
  assert.equal(deriveRoleFromAncestry(["Card", "Body"]), "other");
});

test("buildSectionPath joins ancestry and node name", () => {
  assert.equal(
    buildSectionPath(["Card", "Hero"], "Title"),
    "Card / Hero / Title"
  );
});

test("isStrictContent flags disclosure role and APR text", () => {
  assert.equal(isStrictContent("Some terms", "disclosure"), true);
  assert.equal(isStrictContent("APR is 19.99%", "other"), true);
  assert.equal(isStrictContent("Earn rewards", "benefit"), false);
});
