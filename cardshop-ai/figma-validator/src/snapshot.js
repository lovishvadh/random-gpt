import { writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * @param {string} outDir
 * @param {import('./types.js').FigmaElement[]} figmaElements
 * @param {import('./types.js').DomElement[]} domElements
 * @param {import('./types.js').BundleMeta} meta
 */
export async function writeSnapshots(outDir, figmaElements, domElements, meta) {
  const figmaPayload = {
    generatedAt: new Date().toISOString(),
    meta,
    count: figmaElements.length,
    elements: figmaElements,
  };

  const domPayload = {
    generatedAt: new Date().toISOString(),
    meta,
    count: domElements.length,
    elements: domElements,
  };

  await writeFile(
    join(outDir, "figma-snapshot.json"),
    JSON.stringify(figmaPayload, null, 2),
    "utf8"
  );
  await writeFile(
    join(outDir, "dom-snapshot.json"),
    JSON.stringify(domPayload, null, 2),
    "utf8"
  );

  return {
    figmaPath: join(outDir, "figma-snapshot.json"),
    domPath: join(outDir, "dom-snapshot.json"),
  };
}
