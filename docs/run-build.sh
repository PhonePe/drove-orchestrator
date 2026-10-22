#!/bin/sh
# Builds the site with the local fence module importable.
#
# zensical resolves superfences format functions as Python callables
# (mermaid_svg.format_mermaid_svg) but does not add the project directory
# to sys.path, so export PYTHONPATH for it.
set -e
cd "$(dirname "$0")"
PYTHONPATH=. zensical build "$@"
