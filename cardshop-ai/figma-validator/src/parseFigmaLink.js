/**
 * @param {string} link
 * @returns {{ fileKey: string, nodeId: string }}
 */
export function parseFigmaLink(link) {
  let url;
  try {
    url = new URL(link.trim());
  } catch {
    throw new Error(`Invalid Figma URL: ${link}`);
  }

  const host = url.hostname.toLowerCase();
  if (!host.includes("figma.com")) {
    throw new Error(`URL must be a figma.com link, got: ${host}`);
  }

  const parts = url.pathname.split("/").filter(Boolean);
  const designIdx = parts.findIndex((p) => p === "design" || p === "file");
  if (designIdx === -1 || !parts[designIdx + 1]) {
    throw new Error(
      "Could not extract file key. Expected format: figma.com/design/<FILE_KEY>/..."
    );
  }

  const fileKey = parts[designIdx + 1];
  const rawNodeId = url.searchParams.get("node-id");
  if (!rawNodeId) {
    throw new Error(
      "Missing node-id query param. Open the frame in Figma and copy the link with ?node-id=..."
    );
  }

  const nodeId = decodeURIComponent(rawNodeId).replace(/-/g, ":");

  return { fileKey, nodeId };
}
