import { writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * @param {string} outDir
 * @param {import('./types.js').FigmaElement[]} figmaElements
 * @param {import('./types.js').BundleMeta} meta
 */
export async function writeFigmaSnapshot(outDir, figmaElements, meta) {
  const figmaPayload = {
    generatedAt: new Date().toISOString(),
    meta,
    count: figmaElements.length,
    elements: figmaElements,
  };

  const figmaPath = join(outDir, "figma-snapshot.json");
  await writeFile(figmaPath, JSON.stringify(figmaPayload, null, 2), "utf8");
  return figmaPath;
}

/**
 * @param {string} outDir
 * @param {import('./types.js').DomElement[]} domElements
 * @param {import('./types.js').BundleMeta} meta
 */
export async function writeDomSnapshot(outDir, domElements, meta) {
  const domPayload = {
    generatedAt: new Date().toISOString(),
    meta,
    count: domElements.length,
    elements: domElements,
  };

  const domPath = join(outDir, "dom-snapshot.json");
  await writeFile(domPath, JSON.stringify(domPayload, null, 2), "utf8");
  return domPath;
}
