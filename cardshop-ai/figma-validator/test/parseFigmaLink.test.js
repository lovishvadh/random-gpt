import test from "node:test";
import assert from "node:assert/strict";
import { parseFigmaLink } from "../src/parseFigmaLink.js";

test("parseFigmaLink extracts fileKey and nodeId from design URL", () => {
  const result = parseFigmaLink(
    "https://www.figma.com/design/abc123XYZ/Cardshop?node-id=1234-5678"
  );
  assert.equal(result.fileKey, "abc123XYZ");
  assert.equal(result.nodeId, "1234:5678");
});

test("parseFigmaLink supports /file/ URLs", () => {
  const result = parseFigmaLink(
    "https://www.figma.com/file/xyz789/Page?node-id=10-20"
  );
  assert.equal(result.fileKey, "xyz789");
  assert.equal(result.nodeId, "10:20");
});

test("parseFigmaLink throws when node-id is missing", () => {
  assert.throws(
    () => parseFigmaLink("https://www.figma.com/design/abc123/Page"),
    /node-id/
  );
});
