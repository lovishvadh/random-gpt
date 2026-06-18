import test from "node:test";
import assert from "node:assert/strict";
import { buildReport, renderHtmlReport } from "../src/reporter.js";

test("buildReport aggregates summary counts", () => {
  const report = buildReport(
    [
      { status: "pass", figmaText: "a", figmaName: "A", domText: "a", matchType: "exact", issues: [], figma: {}, dom: null },
      { status: "warn", figmaText: "b", figmaName: "B", domText: "b", matchType: "exact", issues: [], figma: {}, dom: null },
      { status: "fail", figmaText: "c", figmaName: "C", domText: null, matchType: "none", issues: [], figma: {}, dom: null },
    ],
    {
      figmaLink: "https://figma.com/design/x",
      pageUrl: "https://example.com",
      fileKey: "x",
      nodeId: "1:2",
    }
  );

  assert.equal(report.summary.total, 3);
  assert.equal(report.summary.pass, 1);
  assert.equal(report.summary.warn, 1);
  assert.equal(report.summary.fail, 1);
});

test("renderHtmlReport produces standalone HTML", () => {
  const report = buildReport([], {
    figmaLink: "https://figma.com/design/x",
    pageUrl: "https://example.com",
    fileKey: "x",
    nodeId: "1:2",
  });
  const html = renderHtmlReport(report);
  assert.ok(html.includes("<!DOCTYPE html>"));
  assert.ok(html.includes("Cardshop Figma Validator Report"));
});
