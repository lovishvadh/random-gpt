#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { comparePairs } from "./comparator.js";
import { config } from "./config.js";
import { scrapeDomElements } from "./domScraper.js";
import { fetchFigmaElements, fetchFigmaFrameSize } from "./figmaClient.js";
import { matchElements } from "./matcher.js";
import { parseFigmaLink } from "./parseFigmaLink.js";
import { buildReport, renderHtmlReport } from "./reporter.js";
import { writeBundle } from "./reviewBundle.js";
import { parseArgs, printHelp } from "./utils/text.js";

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  validateInputs(args);

  const { fileKey, nodeId } = parseFigmaLink(args.figma);
  const outDir = resolve(args.outDir);
  const mode = args.mode === "bundle" ? "bundle" : "report";

  console.log("Cardshop Figma Validator");
  console.log("------------------------");
  console.log(`Mode       : ${mode}`);
  console.log(`Figma file : ${fileKey}`);
  console.log(`Figma node : ${nodeId}`);
  console.log(`Page URL   : ${args.url}`);
  console.log("");

  const frameSize = await fetchFigmaFrameSize(fileKey, nodeId, args.token);
  const viewportWidth =
    args.viewportWidth ?? frameSize?.width ?? config.viewport.width;

  console.log(`Viewport   : ${viewportWidth}px wide`);
  console.log("Fetching Figma nodes...");

  const figmaElements = await fetchFigmaElements(fileKey, nodeId, args.token);
  console.log(`  Found ${figmaElements.length} text nodes in Figma`);

  console.log("Scraping live page (Playwright)...");
  const domElements = await scrapeDomElements(args.url, {
    viewportWidth,
    viewportHeight: config.viewport.height,
    waitSelector: args.waitSelector || undefined,
  });
  console.log(`  Found ${domElements.length} visible text elements on page`);

  console.log("Matching and comparing (baseline)...");
  const pairs = matchElements(figmaElements, domElements);
  const results = comparePairs(pairs);

  const report = buildReport(results, {
    figmaLink: args.figma,
    pageUrl: args.url,
    fileKey,
    nodeId,
  });

  await mkdir(outDir, { recursive: true });

  if (mode === "bundle") {
    const paths = await writeBundle(outDir, {
      meta: {
        figmaLink: args.figma,
        pageUrl: args.url,
        fileKey,
        nodeId,
        viewportWidth,
      },
      figmaElements,
      domElements,
      naiveFindings: report,
      bundleDir: outDir,
    });

    console.log("");
    console.log("Bundle summary");
    console.log(`  Figma nodes : ${figmaElements.length}`);
    console.log(`  DOM nodes   : ${domElements.length}`);
    console.log(`  Naive FAIL  : ${report.summary.fail}`);
    console.log(`  Naive WARN  : ${report.summary.warn}`);
    console.log(`  Naive PASS  : ${report.summary.pass}`);
    console.log("");
    console.log("Copilot agent bundle written:");
    console.log(`  ${paths.reviewPath}`);
    console.log(`  ${paths.figmaPath}`);
    console.log(`  ${paths.domPath}`);
    console.log(`  ${paths.naivePath}`);
    console.log("");
    console.log("Next: Open REVIEW.md in Copilot agent mode for semantic triage.");

    process.exit(0);
  }

  const htmlPath = join(outDir, config.output.html);
  const jsonPath = join(outDir, config.output.json);

  await writeFile(htmlPath, renderHtmlReport(report), "utf8");
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf8");

  console.log("");
  console.log("Summary");
  console.log(`  Total : ${report.summary.total}`);
  console.log(`  Fail  : ${report.summary.fail}`);
  console.log(`  Warn  : ${report.summary.warn}`);
  console.log(`  Pass  : ${report.summary.pass}`);
  console.log("");
  console.log("Report written:");
  console.log(`  ${htmlPath}`);
  console.log(`  ${jsonPath}`);

  process.exit(report.summary.fail > 0 ? 1 : 0);
}

/**
 * @param {ReturnType<typeof parseArgs>} args
 */
function validateInputs(args) {
  const missing = [];
  if (!args.figma) missing.push("--figma");
  if (!args.token) missing.push("--token (or FIGMA_TOKEN env)");
  if (!args.url) missing.push("--url");

  if (missing.length > 0) {
    console.error(`Missing required arguments: ${missing.join(", ")}`);
    printHelp();
    process.exit(1);
  }

  if (args.mode && !["report", "bundle"].includes(args.mode)) {
    console.error(`Invalid --mode "${args.mode}". Use "report" or "bundle".`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
