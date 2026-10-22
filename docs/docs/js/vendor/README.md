# Vendored JS libraries

These are vendored copies of third-party libraries used by the Drove docs
site. They remove the runtime dependency on external CDNs. The site serves
every script and stylesheet from its own origin.

| Library | Version | Source |
|---------|---------|--------|
| mermaid | 11.17.2 | https://unpkg.com/mermaid@11.17.2/dist/ |
| @mermaid-js/layout-elk | 0.2.3 | https://unpkg.com/@mermaid-js/layout-elk@0.2.3/dist/ |
| iframe-worker | 1.0.4 | https://unpkg.com/iframe-worker@1.0.4/shim |
| glightbox | 3.3.1 | https://unpkg.com/glightbox@3.3.1/dist/ |

## Layout

```
vendor/
  mermaid/
    mermaid.esm.min.mjs
    chunks/mermaid.esm.min/*.mjs
  layout-elk/
    mermaid-layout-elk.esm.min.mjs
    chunks/mermaid-layout-elk.esm.min/*.mjs
  iframe-worker/
    iframe-worker.js
  glightbox/
    glightbox.min.js
    glightbox.min.css
```

Only the files reachable from the entry modules are vendored. The entry
module imports some chunks statically. Other diagram chunks load lazily at
run time through dynamic `import()`. All are present.

## Other CDN dependencies

The zensical offline plugin injects the iframe-worker shim from unpkg
unless `extra.polyfills` in `zensical.toml` already lists it. The config
sets it to the vendored copy.

The `overrides/` directory (set as `theme.custom_dir` in `zensical.toml`)
removes the remaining external requests:

- `main.html` drops the Google Fonts links and loads the vendored
  glightbox before the theme bundle runs.
- `partials/source.html` drops the `data-md-component="source"` attribute,
  which stops the repository statistics fetch to api.github.com.

## Updating

To update to a new version:

1. Download the new entry module from unpkg. Example for mermaid 11.x.y:

   ```shell
   curl -sSL -o mermaid.esm.min.mjs \
     https://unpkg.com/mermaid@11.x.y/dist/mermaid.esm.min.mjs
   ```

2. Resolve every relative import in the module graph and download each
   missing file into `chunks/mermaid.esm.min/`. The graph includes dynamic
   imports, so repeat the scan until no file is missing.

3. Do the same for `@mermaid-js/layout-elk` into `chunks/mermaid-layout-elk.esm.min/`.

4. Remove the old chunk files first. Chunk names carry content hashes and
   change between versions.

5. For iframe-worker and glightbox, replace the single files in their
   directories.

6. Update the version table in this file.

## License

Mermaid and layout-elk are MIT licensed. See the upstream repositories:
https://github.com/mermaid-js/mermaid
https://github.com/mermaid-js/layout-elk

iframe-worker is MIT licensed: https://github.com/platane/iframe-worker

glightbox is MIT licensed: https://github.com/biati-digital/glightbox

## Pre-rendered mermaid diagrams

Diagrams are pre-rendered at build time, not in the browser:

1. `node tools/render-mermaid.mjs` renders every ``` ```mermaid ``` fence in
   `docs/` to an SVG in `docs/mermaid-cache/<sha1>.svg`, using the same
   vendored mermaid + ELK modules the site ships.
2. `zensical.toml` points the superfences mermaid fence at
   `mermaid_svg.format_mermaid_svg`, which looks the SVG up by hash and
   inlines it into the page. If the cache entry is missing it falls back to
   a plain code block with the diagram source.
3. zensical does not add the project directory to `sys.path`, so run builds
   and the preview server through the wrappers, which export `PYTHONPATH=.`
   for `mermaid_svg.py`:
   - `./run-build.sh` (instead of `zensical build`)
   - `./run-serve.sh` (instead of `zensical serve`)

The cache key is the sha1 of the fence source with line endings normalized
to `\n` and trailing newlines stripped, matching what pymdownx superfences
passes to the format function.

## Renderer-only files

`js/mermaid.mjs` and the vendored `js/vendor/mermaid/` and
`js/vendor/layout-elk/` trees are NOT served to site visitors. All mermaid
diagrams are pre-rendered to inline SVG at build time, so the site loads no
mermaid at runtime. These files exist only as the entry point and modules
for `tools/render-mermaid.mjs`. The `[project.plugins.exclude]` section in
`zensical.toml` keeps them out of the published site.
