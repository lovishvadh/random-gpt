/**
 * @typedef {'hero'|'cta'|'benefit'|'disclosure'|'nav'|'other'} RoleHint
 */

/** @type {Array<{ role: RoleHint, patterns: RegExp[] }>} */
const ROLE_PATTERNS = [
  { role: "hero", patterns: [/hero/i, /headline/i, /banner/i, /masthead/i] },
  { role: "cta", patterns: [/cta/i, /apply/i, /button/i, /action/i] },
  {
    role: "benefit",
    patterns: [/benefit/i, /feature/i, /perk/i, /reward/i, /offer/i],
  },
  {
    role: "disclosure",
    patterns: [
      /disclosure/i,
      /legal/i,
      /terms/i,
      /fees?/i,
      /apr/i,
      /fineprint/i,
      /compliance/i,
    ],
  },
  { role: "nav", patterns: [/nav/i, /breadcrumb/i, /header/i, /footer/i, /menu/i] },
];

/**
 * Derive a coarse semantic role from Figma layer / frame names.
 * @param {string} name
 * @returns {RoleHint}
 */
export function deriveRoleHint(name) {
  const haystack = name || "";
  for (const { role, patterns } of ROLE_PATTERNS) {
    if (patterns.some((p) => p.test(haystack))) return role;
  }
  return "other";
}

/**
 * Pick role from an ancestry path (deepest meaningful frame wins).
 * @param {string[]} ancestryNames
 * @returns {RoleHint}
 */
export function deriveRoleFromAncestry(ancestryNames) {
  for (let i = ancestryNames.length - 1; i >= 0; i--) {
    const hint = deriveRoleHint(ancestryNames[i]);
    if (hint !== "other") return hint;
  }
  return "other";
}

/**
 * @param {string[]} ancestryNames
 * @param {string} nodeName
 */
export function buildSectionPath(ancestryNames, nodeName) {
  const parts = [...ancestryNames.filter(Boolean), nodeName].filter(Boolean);
  return parts.join(" / ") || nodeName || "Unknown";
}

/**
 * @param {string} text
 * @param {RoleHint} roleHint
 */
export function isStrictContent(text, roleHint) {
  if (roleHint === "disclosure") return true;
  const lower = text.toLowerCase();
  return (
    /\bapr\b/.test(lower) ||
    /\bfee[s]?\b/.test(lower) ||
    /\bterms\b/.test(lower) ||
    /\bdisclosure\b/.test(lower)
  );
}
