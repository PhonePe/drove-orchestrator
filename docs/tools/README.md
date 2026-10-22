# Mermaid pre-render tooling

`render-mermaid.mjs` pre-renders every ``` ```mermaid ``` fence in `docs/`
to an SVG in `docs/mermaid-cache/`, using the vendored mermaid + ELK
modules in `docs/js/`.

## Usage

```sh
cd tools
npm install          # installs puppeteer (dev dependency, not committed)
node render-mermaid.mjs
```

The renderer needs `puppeteer` and a headless Chromium. Install it once
inside `tools/`; `node_modules` is not committed to the repository.

After rendering, build the site from `docs/`:

```sh
./run-build.sh       # or ./run-serve.sh for live preview
```

The build inlines the cached SVGs into the pages (see `mermaid_svg.py`).
The `[project.plugins.exclude]` section in `zensical.toml` keeps the
renderer and its vendored modules out of the published site.
