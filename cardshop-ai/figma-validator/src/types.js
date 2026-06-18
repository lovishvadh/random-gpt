/**
 * @typedef {Object} ValidatorConfig
 * @property {{ width: number, height: number }} viewport
 * @property {{ fontSizePx: number, fontWeight: number, dimensionPct: number, colorExact: boolean }} tolerances
 * @property {string[]} domSelectors
 * @property {{ waitUntil: 'load'|'domcontentloaded'|'networkidle'|'commit', timeoutMs: number }} pageLoad
 * @property {{ html: string, json: string }} output
 */

/**
 * @typedef {Object} FigmaFill
 * @property {string} type
 * @property {boolean} [visible]
 * @property {{ r: number, g: number, b: number, a?: number }} [color]
 */

/**
 * @typedef {Object} FigmaNode
 * @property {string} id
 * @property {string} type
 * @property {string} [name]
 * @property {string} [characters]
 * @property {FigmaFill[]} [fills]
 * @property {{ fontSize?: number, fontWeight?: number }} [style]
 * @property {{ width: number, height: number }} [absoluteBoundingBox]
 * @property {FigmaNode[]} [children]
 */

/**
 * @typedef {'hero'|'cta'|'benefit'|'disclosure'|'nav'|'other'} RoleHint
 */

/**
 * @typedef {Object} FigmaElement
 * @property {string} id
 * @property {string} name
 * @property {string} text
 * @property {number | null} fontSize
 * @property {number | null} fontWeight
 * @property {string | null} color
 * @property {number | null} width
 * @property {number | null} height
 * @property {string} frameId
 * @property {string} [sectionPath]
 * @property {RoleHint} [roleHint]
 */

/**
 * @typedef {Object} DomElement
 * @property {string} text
 * @property {string} tag
 * @property {number | null} fontSize
 * @property {number | null} fontWeight
 * @property {string | null} color
 * @property {number | null} width
 * @property {number | null} height
 * @property {string} [selector]
 * @property {string} [sectionContext]
 * @property {string | null} [nearestHeading]
 */

/**
 * @typedef {Object} BundleMeta
 * @property {string} figmaLink
 * @property {string} pageUrl
 * @property {string} fileKey
 * @property {string} nodeId
 * @property {number} viewportWidth
 */

/**
 * @typedef {Object} ReviewBundleInput
 * @property {BundleMeta} meta
 * @property {FigmaElement[]} figmaElements
 * @property {DomElement[]} domElements
 * @property {ValidationReport} naiveFindings
 * @property {string} bundleDir
 */

/**
 * @typedef {Object} ScrapeOptions
 * @property {number} [viewportWidth]
 * @property {number} [viewportHeight]
 * @property {string} [waitSelector]
 * @property {string[]} [selectors]
 * @property {'load'|'domcontentloaded'|'networkidle'|'commit'} [waitUntil]
 * @property {number} [timeoutMs]
 */

/**
 * @typedef {Object} MatchedPair
 * @property {FigmaElement} figma
 * @property {DomElement | null} dom
 * @property {'exact' | 'fuzzy' | 'none'} matchType
 * @property {boolean} ambiguous
 * @property {number} [ambiguousCount]
 */

/**
 * @typedef {'pass' | 'warn' | 'fail'} ResultStatus
 */

/**
 * @typedef {Object} ComparisonIssue
 * @property {'missing-text'|'text-diff'|'font-size'|'font-weight'|'color'|'dimension'|'ambiguous'} type
 * @property {'pass'|'warn'|'fail'} level
 * @property {string} message
 * @property {string | null} figmaValue
 * @property {string | null} domValue
 */

/**
 * @typedef {Object} ComparisonResult
 * @property {string} figmaText
 * @property {string} figmaName
 * @property {string | null} domText
 * @property {'exact' | 'fuzzy' | 'none'} matchType
 * @property {ResultStatus} status
 * @property {ComparisonIssue[]} issues
 * @property {FigmaElement} figma
 * @property {DomElement | null} dom
 */

/**
 * @typedef {Object} ValidationReport
 * @property {string} generatedAt
 * @property {{ figmaLink: string, pageUrl: string, fileKey: string, nodeId: string }} meta
 * @property {{ pass: number, warn: number, fail: number, total: number }} summary
 * @property {ComparisonResult[]} results
 */

export {};
