import { chromium } from "playwright";
import { config } from "./config.js";

/**
 * @param {string} pageUrl
 * @param {import('./types.js').ScrapeOptions} [options]
 * @returns {Promise<import('./types.js').DomElement[]>}
 */
export async function scrapeDomElements(pageUrl, options = {}) {
  const viewport = {
    width: options.viewportWidth ?? config.viewport.width,
    height: options.viewportHeight ?? config.viewport.height,
  };

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport });

  try {
    await page.goto(pageUrl, {
      waitUntil: options.waitUntil ?? config.pageLoad.waitUntil,
      timeout: options.timeoutMs ?? config.pageLoad.timeoutMs,
    });

    if (options.waitSelector) {
      await page.waitForSelector(options.waitSelector, {
        timeout: options.timeoutMs ?? config.pageLoad.timeoutMs,
      });
    }

    const selectorList = (options.selectors ?? config.domSelectors).join(",");

    const elements = await page.$$eval(selectorList, (nodes) => {
      /** @param {Element} el */
      const directText = (el) => {
        let text = "";
        for (const child of el.childNodes) {
          if (child.nodeType === Node.TEXT_NODE) {
            text += child.textContent || "";
          }
        }
        return text.trim();
      };

      /** @param {Element} el */
      const getStableSelector = (el) => {
        if (el.id) return `#${CSS.escape(el.id)}`;

        const tag = el.tagName.toLowerCase();
        const testId = el.getAttribute("data-testid");
        if (testId) return `[data-testid="${testId}"]`;

        const dataFigmaId = el.getAttribute("data-figma-id");
        if (dataFigmaId) return `[data-figma-id="${dataFigmaId}"]`;

        const parts = [];
        let current = el;
        let depth = 0;

        while (current && current.nodeType === Node.ELEMENT_NODE && depth < 4) {
          let part = current.tagName.toLowerCase();
          const parent = current.parentElement;

          if (parent) {
            const siblings = Array.from(parent.children).filter(
              (c) => c.tagName === current.tagName
            );
            if (siblings.length > 1) {
              const index = siblings.indexOf(current) + 1;
              part += `:nth-of-type(${index})`;
            }
          }

          parts.unshift(part);
          current = parent;
          depth++;
        }

        return parts.join(" > ") || tag;
      };

      /** @param {Element} el */
      const getSectionContext = (el) => {
        const landmarks = ["main", "header", "footer", "nav", "section", "article", "aside"];
        let current = el.parentElement;

        while (current) {
          const tag = current.tagName.toLowerCase();
          if (landmarks.includes(tag)) {
            const aria = current.getAttribute("aria-label");
            const id = current.id;
            if (aria) return `${tag}[${aria}]`;
            if (id) return `${tag}#${id}`;
            return tag;
          }
          current = current.parentElement;
        }

        return "document";
      };

      /** @param {Element} el */
      const getNearestHeading = (el) => {
        let current = el.parentElement;

        while (current) {
          const heading = current.querySelector("h1,h2,h3,h4,h5,h6");
          if (heading?.textContent?.trim()) {
            return heading.textContent.trim();
          }
          current = current.parentElement;
        }

        let prev = el.previousElementSibling;
        while (prev) {
          if (/^H[1-6]$/.test(prev.tagName) && prev.textContent?.trim()) {
            return prev.textContent.trim();
          }
          prev = prev.previousElementSibling;
        }

        return null;
      };

      /** @param {Element} el */
      const collect = (el) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        if (rect.width < 1 || rect.height < 1) return null;
        if (style.visibility === "hidden" || style.display === "none") return null;

        const text = directText(el) || el.textContent?.trim() || "";
        if (!text || text.length < 2) return null;

        return {
          text,
          tag: el.tagName.toLowerCase(),
          fontSize: parseFloat(style.fontSize) || null,
          fontWeight: parseInt(style.fontWeight, 10) || null,
          color: style.color,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          selector: getStableSelector(el),
          sectionContext: getSectionContext(el),
          nearestHeading: getNearestHeading(el),
        };
      };

      const results = [];
      const seen = new Set();

      for (const node of nodes) {
        const item = collect(node);
        if (!item) continue;

        const key = `${item.selector}|${item.text}`;
        if (seen.has(key)) continue;
        seen.add(key);
        results.push(item);
      }

      return results;
    });

    return elements;
  } finally {
    await browser.close();
  }
}
