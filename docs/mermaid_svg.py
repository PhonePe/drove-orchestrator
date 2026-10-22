"""Mermaid superfences format function that returns a pre-rendered SVG.

The site pre-renders every mermaid diagram at build time (see
tools/render-mermaid.mjs). The renderer writes one content-addressed SVG
per diagram into docs/docs/mermaid-cache/<sha1>.svg. This fence format
function looks the diagram up by hash and inlines the SVG into the page.

When the SVG is missing (renderer not run yet), the function falls back to
the standard mermaid code block so the diagram source stays visible during
local edits, and prints a warning so the missing render step is not
silently shipped to the published site.
"""

from __future__ import annotations

import hashlib
import sys
from pathlib import Path

from pymdownx.superfences import fence_code_format

_ROOT = Path(__file__).resolve().parent          # docs/
_CACHE = _ROOT / "docs" / "mermaid-cache"

def _hash(source: str) -> str:
    # Superfences strips the fence's trailing newline before it calls this
    # format function. tools/render-mermaid.mjs hashes the same normalized
    # source, so both sides agree on the cache key.
    return hashlib.sha1(source.rstrip("\n").encode("utf-8")).hexdigest()[:16]

def format_mermaid_svg(
    source: str,
    language: str | None = None,
    class_name: str | None = None,
    options: dict | None = None,
    md: object = None,
    **kwargs,
) -> str:
    """Return a pre-rendered mermaid SVG, or a code block as fallback."""
    svg_path = _CACHE / f"{_hash(source)}.svg"
    if not svg_path.exists():
        print(
            f"mermaid_svg: WARNING: no cached SVG for hash "
            f"{_hash(source)}; run 'node tools/render-mermaid.mjs' "
            f"from docs/ to render the diagram",
            file=sys.stderr,
        )
        return fence_code_format(
            source, language, class_name, options, md, **kwargs
        )
    svg = svg_path.read_text(encoding="utf-8")
    # The renderer emits width="100%" with a max-width; wrap it so the
    # diagram is centered like the runtime-rendered ones.
    return f'<div class="mermaid-svg">{svg}</div>'
