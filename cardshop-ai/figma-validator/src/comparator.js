import { colorsMatch } from "./utils/color.js";
import { config } from "./config.js";

/**
 * @param {import('./types.js').MatchedPair[]} pairs
 * @param {import('./types.js').ValidatorConfig['tolerances']} [tolerances]
 * @returns {import('./types.js').ComparisonResult[]}
 */
export function comparePairs(pairs, tolerances = config.tolerances) {
  return pairs.map((pair) => comparePair(pair, tolerances));
}

/**
 * @param {import('./types.js').MatchedPair} pair
 * @param {import('./types.js').ValidatorConfig['tolerances']} tolerances
 * @returns {import('./types.js').ComparisonResult}
 */
function comparePair(pair, tolerances) {
  /** @type {import('./types.js').ComparisonIssue[]} */
  const issues = [];

  if (!pair.dom) {
    issues.push({
      type: "missing-text",
      level: "fail",
      message: "Text from Figma not found on live page",
      figmaValue: pair.figma.text,
      domValue: null,
    });

    return buildResult(pair, issues, "fail");
  }

  if (pair.ambiguous) {
    issues.push({
      type: "ambiguous",
      level: "warn",
      message: `Multiple DOM elements matched this text (${pair.ambiguousCount} candidates)`,
      figmaValue: pair.figma.text,
      domValue: pair.dom.text,
    });
  }

  if (pair.matchType === "fuzzy" && pair.figma.text !== pair.dom.text) {
    issues.push({
      type: "text-diff",
      level: "warn",
      message: "Text matched only after normalization (whitespace/case/punctuation)",
      figmaValue: pair.figma.text,
      domValue: pair.dom.text,
    });
  }

  compareFontSize(pair, issues, tolerances);
  compareFontWeight(pair, issues, tolerances);
  compareColor(pair, issues);
  compareDimensions(pair, issues, tolerances);

  const status = deriveStatus(issues);
  return buildResult(pair, issues, status);
}

/**
 * @param {import('./types.js').MatchedPair} pair
 * @param {import('./types.js').ComparisonIssue[]} issues
 * @param {import('./types.js').ValidatorConfig['tolerances']} tolerances
 */
function compareFontSize(pair, issues, tolerances) {
  const figmaSize = pair.figma.fontSize;
  const domSize = pair.dom?.fontSize;

  if (figmaSize == null || domSize == null) return;

  if (Math.abs(figmaSize - domSize) > tolerances.fontSizePx) {
    issues.push({
      type: "font-size",
      level: "warn",
      message: `Font size differs by more than ${tolerances.fontSizePx}px`,
      figmaValue: `${figmaSize}px`,
      domValue: `${domSize}px`,
    });
  }
}

/**
 * @param {import('./types.js').MatchedPair} pair
 * @param {import('./types.js').ComparisonIssue[]} issues
 * @param {import('./types.js').ValidatorConfig['tolerances']} tolerances
 */
function compareFontWeight(pair, issues, tolerances) {
  const figmaWeight = pair.figma.fontWeight;
  const domWeight = pair.dom?.fontWeight;

  if (figmaWeight == null || domWeight == null) return;

  if (Math.abs(figmaWeight - domWeight) > tolerances.fontWeight) {
    issues.push({
      type: "font-weight",
      level: "warn",
      message: `Font weight differs by more than ${tolerances.fontWeight}`,
      figmaValue: String(figmaWeight),
      domValue: String(domWeight),
    });
  }
}

/**
 * @param {import('./types.js').MatchedPair} pair
 * @param {import('./types.js').ComparisonIssue[]} issues
 */
function compareColor(pair, issues) {
  const figmaColor = pair.figma.color;
  const domColor = pair.dom?.color;

  if (!figmaColor || !domColor) return;

  if (!colorsMatch(figmaColor, domColor)) {
    issues.push({
      type: "color",
      level: "warn",
      message: "Text color does not match",
      figmaValue: figmaColor,
      domValue: domColor,
    });
  }
}

/**
 * @param {import('./types.js').MatchedPair} pair
 * @param {import('./types.js').ComparisonIssue[]} issues
 * @param {import('./types.js').ValidatorConfig['tolerances']} tolerances
 */
function compareDimensions(pair, issues, tolerances) {
  const pairs = [
    ["width", pair.figma.width, pair.dom?.width],
    ["height", pair.figma.height, pair.dom?.height],
  ];

  for (const [label, figmaVal, domVal] of pairs) {
    if (figmaVal == null || domVal == null || figmaVal === 0) continue;

    const pctDiff = (Math.abs(figmaVal - domVal) / figmaVal) * 100;
    if (pctDiff > tolerances.dimensionPct) {
      issues.push({
        type: "dimension",
        level: "warn",
        message: `${label} differs by more than ${tolerances.dimensionPct}% (responsive reflow — warn only)`,
        figmaValue: `${figmaVal}px`,
        domValue: `${domVal}px`,
      });
    }
  }
}

/**
 * @param {import('./types.js').ComparisonIssue[]} issues
 * @returns {import('./types.js').ResultStatus}
 */
function deriveStatus(issues) {
  if (issues.some((i) => i.level === "fail")) return "fail";
  if (issues.length > 0) return "warn";
  return "pass";
}

/**
 * @param {import('./types.js').MatchedPair} pair
 * @param {import('./types.js').ComparisonIssue[]} issues
 * @param {import('./types.js').ResultStatus} status
 */
function buildResult(pair, issues, status) {
  return {
    figmaText: pair.figma.text,
    figmaName: pair.figma.name,
    domText: pair.dom?.text ?? null,
    matchType: pair.matchType,
    status,
    issues,
    figma: pair.figma,
    dom: pair.dom,
  };
}
