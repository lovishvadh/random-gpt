/** @type {import('./types.js').ValidatorConfig} */
export const config = {
  viewport: {
    width: 1440,
    height: 900,
  },
  tolerances: {
    fontSizePx: 1,
    fontWeight: 100,
    dimensionPct: 10,
    colorExact: true,
  },
  domSelectors: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "span",
    "a",
    "button",
    "li",
    "strong",
    "em",
    "label",
    "td",
    "th",
  ],
  pageLoad: {
    waitUntil: "networkidle",
    timeoutMs: 60000,
  },
  output: {
    html: "report.html",
    json: "report.json",
  },
};
