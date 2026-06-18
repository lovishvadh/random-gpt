import { fillToHex } from "./utils/color.js";
import {
  buildSectionPath,
  deriveRoleFromAncestry,
  deriveRoleHint,
} from "./utils/roleHint.js";
import { isMeaningfulText } from "./utils/text.js";

/**
 * @param {string} fileKey
 * @param {string} nodeId
 * @param {string} token
 * @returns {Promise<import('./types.js').FigmaElement[]>}
 */
export async function fetchFigmaElements(fileKey, nodeId, token) {
  const encodedId = encodeURIComponent(nodeId);
  const apiUrl = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodedId}`;

  const response = await fetch(apiUrl, {
    headers: { "X-Figma-Token": token },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Figma API error ${response.status}: ${body.slice(0, 300)}`
    );
  }

  const data = await response.json();
  const rootNode = data?.nodes?.[nodeId]?.document;

  if (!rootNode) {
    throw new Error(
      `Node ${nodeId} not found in Figma response. Check the link and token permissions.`
    );
  }

  /** @type {import('./types.js').FigmaElement[]} */
  const elements = [];
  walkNode(rootNode, elements, nodeId, []);
  return elements;
}

/**
 * @param {import('./types.js').FigmaNode} node
 * @param {import('./types.js').FigmaElement[]} elements
 * @param {string} rootId
 * @param {string[]} ancestryNames
 */
function walkNode(node, elements, rootId, ancestryNames) {
  const isContainer =
    node.type === "FRAME" ||
    node.type === "GROUP" ||
    node.type === "COMPONENT" ||
    node.type === "INSTANCE" ||
    node.type === "SECTION";

  const nextAncestry = isContainer && node.name
    ? [...ancestryNames, node.name]
    : ancestryNames;

  if (node.type === "TEXT" && node.characters) {
    const text = node.characters.trim();
    if (isMeaningfulText(text)) {
      const box = node.absoluteBoundingBox;
      const solidFill = node.fills?.find(
        (f) => f.type === "SOLID" && f.visible !== false
      );
      const nodeName = node.name || "TEXT";
      const roleHint =
        deriveRoleHint(nodeName) !== "other"
          ? deriveRoleHint(nodeName)
          : deriveRoleFromAncestry(ancestryNames);

      elements.push({
        id: node.id,
        name: nodeName,
        text,
        fontSize: node.style?.fontSize ?? null,
        fontWeight: node.style?.fontWeight ?? null,
        color: fillToHex(solidFill),
        width: box ? Math.round(box.width) : null,
        height: box ? Math.round(box.height) : null,
        frameId: rootId,
        sectionPath: buildSectionPath(ancestryNames, nodeName),
        roleHint,
      });
    }
  }

  if (node.children?.length) {
    for (const child of node.children) {
      walkNode(child, elements, rootId, nextAncestry);
    }
  }
}

/**
 * @param {string} fileKey
 * @param {string} nodeId
 * @param {string} token
 */
export async function fetchFigmaFrameSize(fileKey, nodeId, token) {
  const encodedId = encodeURIComponent(nodeId);
  const apiUrl = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodedId}`;
  const response = await fetch(apiUrl, {
    headers: { "X-Figma-Token": token },
  });

  if (!response.ok) return null;

  const data = await response.json();
  const box = data?.nodes?.[nodeId]?.document?.absoluteBoundingBox;
  if (!box) return null;

  return {
    width: Math.round(box.width),
    height: Math.round(box.height),
  };
}
