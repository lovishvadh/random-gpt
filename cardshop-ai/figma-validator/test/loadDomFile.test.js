import test from "node:test";
import assert from "node:assert/strict";
import { loadDomFile } from "../src/loadDomFile.js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("loadDomFile reads array format", async () => {
  const elements = await loadDomFile(
    join(__dirname, "..", "fixtures", "sample-dom.json")
  );
  assert.equal(elements.length, 4);
  assert.equal(elements[0].text, "The Platinum Card");
  assert.equal(elements[0].tag, "h1");
});

test("loadDomFile rejects element missing text", async () => {
  const { mkdtemp, writeFile, rm } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const { tmpdir } = await import("node:os");
  const dir = await mkdtemp(join(tmpdir(), "dom-test-"));
  const file = join(dir, "bad.json");
  await writeFile(file, JSON.stringify([{ tag: "p" }]), "utf8");
  await assert.rejects(() => loadDomFile(file), /text/);
  await rm(dir, { recursive: true });
});
