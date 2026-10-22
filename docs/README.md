# Mermaid pre-render tooling

`render-mermaid.mjs` pre-renders every ``` ```mermaid ``` fence in `docs/`
to an SVG in `docs/mermaid-cache/`, using the vendored mermaid + ELK
modules in `docs/js/`.

## Usage

```sh
cd tools
npm install          # installs puppeteer (dev dependency, not committed)
node render-mermaid.mjs [--prune]
```

The renderer needs `puppeteer` and a headless Chromium. Install it once
inside `tools/`; `node_modules` is not committed to the repository.

`--prune` also deletes cache files whose hash matches no current diagram
source. Use it after editing or removing diagrams so the cache does not
accumulate stale SVGs. `run-build.sh` and `run-serve.sh` run the renderer
with `--prune` automatically (skip with `NO_RENDER_MERMAID=1`).

After rendering, build the site from `docs/`:

```sh
./run-build.sh       # or ./run-serve.sh for live preview
```

The build inlines the cached SVGs into the pages (see `mermaid_svg.py`).
If a diagram has no cached SVG (renderer not run), the build prints a
warning and falls back to a plain code block. The
`[project.plugins.exclude]` section in `zensical.toml` keeps the
renderer and its vendored modules out of the published site.

## How the cache works

The cache key is the SHA-1 (first 16 hex chars) of the diagram source
with line endings normalized to `\n` and trailing newlines stripped.
Editing a diagram therefore produces a new cache file; the old one only
disappears when `--prune` runs. Cache SVGs are committed to the
repository because CI builds the site without Node.js.
