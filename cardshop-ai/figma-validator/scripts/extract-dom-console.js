/**
 * Cardshop DOM Extract — DevTools Console Snippet
 *
 * HOW TO USE:
 * 1. Open the Cardshop page in corporate Chrome/Edge
 * 2. Open DevTools → Console
 * 3. Copy everything between START and END below, paste into console, press Enter
 * 4. Save the downloaded/copied JSON as dom-snapshot.json
 * 5. Run CLI: node src/index.js --figma ... --url ... --dom-file dom-snapshot.json --out bundle
 *
 * --- START (copy from here) ---
 */

(() => {
  const selectors = [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "span", "a", "button", "li", "strong", "em", "label", "td", "th",
  ].join(",");

  const directText = (el) => {
    let text = "";
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) text += child.textContent || "";
    }
    return text.trim();
  };

  const getStableSelector = (el) => {
    if (el.id) return `#${CSS.escape(el.id)}`;
    const testId = el.getAttribute("data-testid");
    if (testId) return `[data-testid="${testId}"]`;
    const figmaId = el.getAttribute("data-figma-id");
    if (figmaId) return `[data-figma-id="${figmaId}"]`;

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
          part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
        }
      }
      parts.unshift(part);
      current = parent;
      depth++;
    }
    return parts.join(" > ") || el.tagName.toLowerCase();
  };

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

  const getNearestHeading = (el) => {
    let current = el.parentElement;
    while (current) {
      const heading = current.querySelector("h1,h2,h3,h4,h5,h6");
      if (heading?.textContent?.trim()) return heading.textContent.trim();
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

  const seen = new Set();
  const elements = [];

  for (const node of document.querySelectorAll(selectors)) {
    const item = collect(node);
    if (!item) continue;
    const key = `${item.selector}|${item.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    elements.push(item);
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    pageUrl: location.href,
    count: elements.length,
    elements,
  };

  const json = JSON.stringify(payload, null, 2);

  if (typeof copy === "function") {
    copy(json);
    console.log(`Copied ${elements.length} DOM elements to clipboard. Save as dom-snapshot.json`);
  } else {
    console.log(json);
    console.log(`Extracted ${elements.length} elements. Copy the JSON above and save as dom-snapshot.json`);
  }

  return payload;
})();

/**
 * --- END ---
 */
