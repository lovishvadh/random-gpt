/**
 * @param {import('./types.js').FigmaFill | undefined} fill
 * @returns {string | null}
 */
export function fillToHex(fill) {
  if (!fill || fill.type !== "SOLID" || !fill.color) return null;

  const { r, g, b, a = 1 } = fill.color;
  const toByte = (v) => Math.round(Math.max(0, Math.min(1, v)) * 255);

  const rr = toByte(r).toString(16).padStart(2, "0");
  const gg = toByte(g).toString(16).padStart(2, "0");
  const bb = toByte(b).toString(16).padStart(2, "0");

  if (a < 1) {
    const aa = toByte(a).toString(16).padStart(2, "0");
    return `#${rr}${gg}${bb}${aa}`;
  }

  return `#${rr}${gg}${bb}`;
}

/**
 * Parse rgb()/rgba() from computed styles to #rrggbb
 * @param {string} cssColor
 * @returns {string | null}
 */
export function cssColorToHex(cssColor) {
  if (!cssColor) return null;

  const trimmed = cssColor.trim().toLowerCase();
  if (trimmed.startsWith("#")) {
    if (trimmed.length === 4) {
      const [, r, g, b] = trimmed;
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return trimmed.slice(0, 7);
  }

  const rgbMatch = trimmed.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/
  );
  if (!rgbMatch) return trimmed;

  const [, r, g, b] = rgbMatch;
  const toHex = (n) =>
    Math.round(Number(n))
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * @param {string | null | undefined} a
 * @param {string | null | undefined} b
 */
export function colorsMatch(a, b) {
  const hexA = cssColorToHex(a || "");
  const hexB = cssColorToHex(b || "");
  if (!hexA || !hexB) return hexA === hexB;
  return hexA === hexB;
}
