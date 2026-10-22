#!/bin/sh
# Serves the site for local preview with the fence module importable.
#
# Same PYTHONPATH reason as run-build.sh: zensical does not add the project
# directory to sys.path, but the superfences format function lives in
# ./mermaid_svg.py.
set -e
cd "$(dirname "$0")"
PYTHONPATH=. zensical serve "$@"
