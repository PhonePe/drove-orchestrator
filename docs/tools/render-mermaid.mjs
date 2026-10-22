// Pre-renders every mermaid diagram in docs/docs to an SVG file.
//
// Uses the same vendored mermaid + ELK modules that the site shipped for
// client-side rendering, loaded through the same wrapper module
// (docs/docs/js/mermaid.mjs), so the output matches the diagrams that were
// reviewed in the browser: ELK layering, enlarged arrowheads, hidden
// helper-node removal.
//
// Usage:  node tools/render-mermaid.mjs
//
// - Scans docs/docs/**/*.md for ```mermaid fences.
// - Writes one SVG per diagram to docs/docs/mermaid-cache/<sha1>.svg.
// - Skips diagrams whose SVG already exists (content-addressed cache).
// - Fails if any diagram fails to render.

import { createHash } from "node:crypto";
import http from "node:http";
import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = path.resolve(HERE, "..");           // docs/
const PAGES_DIR = path.join(DOCS_ROOT, "docs");       // docs/docs/
const OUT_DIR = path.join(PAGES_DIR, "mermaid-cache");

const FENCE_RE = /```mermaid\n([\s\S]*?)```/g;

async function collectDiagrams() {
  const diagrams = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "mermaid-cache") continue;
        await walk(p);
      } else if (entry.name.endsWith(".md")) {
        const text = await readFile(p, "utf8");
        for (const m of text.matchAll(FENCE_RE)) {
          diagrams.push({ source: m[1] });
        }
      }
    }
  }
  await walk(PAGES_DIR);
  return diagrams;
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

// Serve docs/docs over loopback HTTP: ES modules need a real origin.
function startServer() {
  const server = http.createServer(async (req, res) => {
    const rel = decodeURIComponent(req.url.split("?")[0]);
    const file = path.join(PAGES_DIR, rel);
    try {
      const data = await readFile(file);
      const ext = path.extname(file).slice(1);
      const type =
        { mjs: "text/javascript", js: "text/javascript", css: "text/css" }[
          ext
        ] || "application/octet-stream";
      res.writeHead(200, { "content-type": type });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end("not found");
    }
  });
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () =>
      resolve({ server, origin: `http://127.0.0.1:${server.address().port}` }),
    ),
  );
}

(async () => {
  const diagrams = await collectDiagrams();
  if (diagrams.length === 0) {
    console.log("render-mermaid: no diagrams found");
    return;
  }

  await mkdir(OUT_DIR, { recursive: true });

  // Assign each diagram a cache key, skip ones already rendered. The key
  // is the sha1 of the source with line endings normalized to \n and
  // trailing newlines stripped, which matches what pymdownx superfences
  // passes to the Python format function (mermaid_svg.py).
  const pending = [];
  for (const d of diagrams) {
    d.source = d.source.replace(/\r\n/g, "\n").replace(/\n+$/, "");
    d.key = createHash("sha1").update(d.source).digest("hex").slice(0, 16);
    d.file = path.join(OUT_DIR, d.key + ".svg");
    if (await exists(d.file)) d.cached = true;
    else pending.push(d);
  }
  console.log(
    `render-mermaid: ${diagrams.length} diagrams, ` +
      `${diagrams.length - pending.length} cached, ${pending.length} to render`,
  );
  if (pending.length === 0) return;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const { server, origin } = await startServer();
  try {
    const page = await browser.newPage();
    page.on("requestfailed", (req) =>
      console.error(`render-mermaid: request failed: ${req.url()}`),
    );
    await page.goto(origin + "/", { waitUntil: "domcontentloaded" });
    await page.addScriptTag({ url: origin + "/js/mermaid.mjs", type: "module" });

    // Wait until the wrapper has installed window.mermaid (incl. ELK).
    await page.waitForFunction(() => typeof window.mermaid === "object", {
      timeout: 60000,
    });

    for (const d of pending) {
      const result = await page.evaluate(async (source) => {
        try {
          const { svg } = await window.mermaid.render(
            "m" + Math.random().toString(36).slice(2),
            source,
          );
          return { ok: true, svg };
        } catch (e) {
          return { ok: false, err: String(e).slice(0, 500) };
        }
      }, d.source);
      if (!result.ok) {
        console.error(`render-mermaid: FAILED for ${d.key}`);
        console.error(result.err);
        process.exitCode = 1;
        continue;
      }
      await writeFile(d.file, result.svg, "utf8");
      console.log(
        `render-mermaid: ${d.key} -> ${path.relative(DOCS_ROOT, d.file)}`,
      );
    }
  } finally {
    server.close();
    await browser.close();
  }
  if (process.exitCode) {
    throw new Error("render-mermaid: one or more diagrams failed to render");
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
