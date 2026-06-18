#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { comparePairs } from "./comparator.js";
import { config } from "./config.js";
import { fetchFigmaElements, fetchFigmaFrameSize } from "./figmaClient.js";
import { loadDomFile } from "./loadDomFile.js";
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

  console.log("Cardshop Figma Validator (Copilot-driven)");
  console.log("-----------------------------------------");
  console.log(`Figma file : ${fileKey}`);
  console.log(`Figma node : ${nodeId}`);
  console.log(`Page URL   : ${args.url}`);
  console.log(`DOM file   : ${args.domFile || "(none — Copilot will fetch page)"}`);
  console.log("");

  const frameSize = await fetchFigmaFrameSize(fileKey, nodeId, args.token);
  const frameWidth = frameSize?.width ?? null;

  if (frameWidth) {
    console.log(`Frame width: ${frameWidth}px (from Figma)`);
  }

  console.log("Fetching Figma nodes...");
  const figmaElements = await fetchFigmaElements(fileKey, nodeId, args.token);
  console.log(`  Found ${figmaElements.length} text nodes in Figma`);

  /** @type {import('./types.js').DomElement[]} */
  let domElements = [];
  /** @type {import('./types.js').ValidationReport | null} */
  let naiveFindings = null;

  if (args.domFile) {
    console.log(`Loading DOM snapshot from ${args.domFile}...`);
    domElements = await loadDomFile(resolve(args.domFile));
    console.log(`  Loaded ${domElements.length} DOM elements`);

    console.log("Running baseline match + compare...");
    const pairs = matchElements(figmaElements, domElements);
    const results = comparePairs(pairs);
    naiveFindings = buildReport(results, {
      figmaLink: args.figma,
      pageUrl: args.url,
      fileKey,
      nodeId,
    });

    console.log(`  Naive FAIL: ${naiveFindings.summary.fail}`);
    console.log(`  Naive WARN: ${naiveFindings.summary.warn}`);
    console.log(`  Naive PASS: ${naiveFindings.summary.pass}`);
  }

  await mkdir(outDir, { recursive: true });

  const meta = {
    figmaLink: args.figma,
    pageUrl: args.url,
    fileKey,
    nodeId,
    frameWidth,
  };

  const paths = await writeBundle(outDir, {
    meta,
    figmaElements,
    domElements,
    naiveFindings: naiveFindings || emptyReport(meta),
    bundleDir: outDir,
    hasDomFile: Boolean(args.domFile),
  });

  if (args.report) {
    if (!args.domFile || !naiveFindings) {
      console.error("--report requires --dom-file");
      process.exit(1);
    }

    const htmlPath = join(outDir, config.output.html);
    const jsonPath = join(outDir, config.output.json);
    await writeFile(htmlPath, renderHtmlReport(naiveFindings), "utf8");
    await writeFile(jsonPath, JSON.stringify(naiveFindings, null, 2), "utf8");
    console.log("");
    console.log("Report written:");
    console.log(`  ${htmlPath}`);
    console.log(`  ${jsonPath}`);
  }

  console.log("");
  console.log("Bundle written:");
  console.log(`  ${paths.reviewPath}`);
  console.log(`  ${paths.figmaPath}`);
  console.log(`  ${paths.metaPath}`);
  if (paths.domPath) console.log(`  ${paths.domPath}`);
  if (paths.naivePath) console.log(`  ${paths.naivePath}`);
  console.log("");
  console.log(
    args.domFile
      ? "Next: Open REVIEW.md in Copilot for semantic triage (dom snapshot included)."
      : "Next: Copilot fetches the page URL and reads REVIEW.md for semantic triage."
  );

  process.exit(
    naiveFindings && naiveFindings.summary.fail > 0 && args.report ? 1 : 0
  );
}

/**
 * @param {import('./types.js').BundleMeta} meta
 */
function emptyReport(meta) {
  return {
    generatedAt: new Date().toISOString(),
    meta: {
      figmaLink: meta.figmaLink,
      pageUrl: meta.pageUrl,
      fileKey: meta.fileKey,
      nodeId: meta.nodeId,
    },
    summary: { total: 0, pass: 0, warn: 0, fail: 0 },
    results: [],
  };
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
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
