#!/bin/sh
# Builds the site with the local fence module importable.
#
# zensical resolves superfences format functions as Python callables
# (mermaid_svg.format_mermaid_svg) but does not add the project directory
# to sys.path, so export PYTHONPATH for it.
#
# Before building, refresh the mermaid diagram cache: render new or
# changed diagrams and prune cache files whose diagram no longer exists.
# Requires node + puppeteer in tools/ (see README.md). Skip with
# NO_RENDER_MERMAID=1 when node is unavailable.
set -e
cd "$(dirname "$0")"

if [ "$NO_RENDER_MERMAID" != "1" ] && command -v node >/dev/null 2>&1; then
    node tools/render-mermaid.mjs --prune
else
    echo "run-build.sh: skipping mermaid render (node unavailable or NO_RENDER_MERMAID=1)"
fi

PYTHONPATH=. zensical build "$@"
