import { readFile } from "node:fs/promises";

/**
 * @param {string} filePath
 * @returns {Promise<import('./types.js').DomElement[]>}
 */
export async function loadDomFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON in dom file: ${filePath}`);
  }

  const elements = Array.isArray(parsed)
    ? parsed
    : parsed?.elements;

  if (!Array.isArray(elements)) {
    throw new Error(
      `DOM file must be an array of elements or { elements: [...] }. Got: ${filePath}`
    );
  }

  return elements.map((el, index) => validateDomElement(el, index));
}

/**
 * @param {unknown} el
 * @param {number} index
 * @returns {import('./types.js').DomElement}
 */
function validateDomElement(el, index) {
  if (!el || typeof el !== "object") {
    throw new Error(`DOM element at index ${index} is not an object`);
  }

  const item = /** @type {Record<string, unknown>} */ (el);

  if (typeof item.text !== "string" || !item.text.trim()) {
    throw new Error(`DOM element at index ${index} missing non-empty "text"`);
  }

  if (typeof item.tag !== "string" || !item.tag.trim()) {
    throw new Error(`DOM element at index ${index} missing "tag"`);
  }

  return {
    text: item.text.trim(),
    tag: item.tag.toLowerCase(),
    fontSize: toNumberOrNull(item.fontSize),
    fontWeight: toNumberOrNull(item.fontWeight),
    color: typeof item.color === "string" ? item.color : null,
    width: toNumberOrNull(item.width),
    height: toNumberOrNull(item.height),
    selector: typeof item.selector === "string" ? item.selector : undefined,
    sectionContext:
      typeof item.sectionContext === "string" ? item.sectionContext : undefined,
    nearestHeading:
      typeof item.nearestHeading === "string"
        ? item.nearestHeading
        : item.nearestHeading === null
          ? null
          : undefined,
  };
}

/** @param {unknown} value */
function toNumberOrNull(value) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
