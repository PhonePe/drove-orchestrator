#!/bin/sh
# Serves the site for local preview with the fence module importable.
#
# Same PYTHONPATH reason as run-build.sh: zensical does not add the project
# directory to sys.path, but the superfences format function lives in
# ./mermaid_svg.py.
#
# Before serving, refresh the mermaid diagram cache like run-build.sh does.
# Skip with NO_RENDER_MERMAID=1 when node is unavailable.
set -e
cd "$(dirname "$0")"

if [ "$NO_RENDER_MERMAID" != "1" ] && command -v node >/dev/null 2>&1; then
    node tools/render-mermaid.mjs --prune
else
    echo "run-serve.sh: skipping mermaid render (node unavailable or NO_RENDER_MERMAID=1)"
fi

PYTHONPATH=. zensical serve "$@"
