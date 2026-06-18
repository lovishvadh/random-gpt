import { normalizeText } from "./utils/text.js";

/**
 * @typedef {'exact' | 'fuzzy' | 'none'} MatchType
 */

/**
 * @param {import('./types.js').FigmaElement[]} figmaElements
 * @param {import('./types.js').DomElement[]} domElements
 * @returns {import('./types.js').MatchedPair[]}
 */
export function matchElements(figmaElements, domElements) {
  const usedDomIndices = new Set();

  return figmaElements.map((figma) => {
    const exactMatches = findExactMatches(figma.text, domElements, usedDomIndices);
    if (exactMatches.length === 1) {
      usedDomIndices.add(exactMatches[0].index);
      return {
        figma,
        dom: exactMatches[0].element,
        matchType: "exact",
        ambiguous: false,
      };
    }

    if (exactMatches.length > 1) {
      const pick = exactMatches[0];
      usedDomIndices.add(pick.index);
      return {
        figma,
        dom: pick.element,
        matchType: "exact",
        ambiguous: true,
        ambiguousCount: exactMatches.length,
      };
    }

    const fuzzyMatches = findFuzzyMatches(figma.text, domElements, usedDomIndices);
    if (fuzzyMatches.length === 1) {
      usedDomIndices.add(fuzzyMatches[0].index);
      return {
        figma,
        dom: fuzzyMatches[0].element,
        matchType: "fuzzy",
        ambiguous: false,
      };
    }

    if (fuzzyMatches.length > 1) {
      const pick = fuzzyMatches[0];
      usedDomIndices.add(pick.index);
      return {
        figma,
        dom: pick.element,
        matchType: "fuzzy",
        ambiguous: true,
        ambiguousCount: fuzzyMatches.length,
      };
    }

    return {
      figma,
      dom: null,
      matchType: "none",
      ambiguous: false,
    };
  });
}

/**
 * @param {string} text
 * @param {import('./types.js').DomElement[]} domElements
 * @param {Set<number>} usedDomIndices
 */
function findExactMatches(text, domElements, usedDomIndices) {
  /** @type {{ index: number, element: import('./types.js').DomElement }[]} */
  const matches = [];

  for (let i = 0; i < domElements.length; i++) {
    if (usedDomIndices.has(i)) continue;
    if (domElements[i].text === text) {
      matches.push({ index: i, element: domElements[i] });
    }
  }

  return matches;
}

/**
 * @param {string} text
 * @param {import('./types.js').DomElement[]} domElements
 * @param {Set<number>} usedDomIndices
 */
function findFuzzyMatches(text, domElements, usedDomIndices) {
  const normalized = normalizeText(text);
  /** @type {{ index: number, element: import('./types.js').DomElement }[]} */
  const matches = [];

  for (let i = 0; i < domElements.length; i++) {
    if (usedDomIndices.has(i)) continue;
    if (normalizeText(domElements[i].text) === normalized) {
      matches.push({ index: i, element: domElements[i] });
    }
  }

  return matches;
}
