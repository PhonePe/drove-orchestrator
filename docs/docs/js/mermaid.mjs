// Vendored copies of mermaid and the ELK layout.
// Update by re-downloading from unpkg (see docs/js/vendor/README.md) and
// replacing the files, then bump the versions noted there.
import mermaid from './vendor/mermaid/mermaid.esm.min.mjs';
import elkLayouts from './vendor/layout-elk/mermaid-layout-elk.esm.min.mjs';

mermaid.registerLayoutLoaders(elkLayouts);
mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  layout: "elk",
});

// Make state diagram arrowheads slightly larger.
// Mermaid does not expose marker size as a config, so scale the marker
// geometry of each rendered SVG.
const ARROW_SCALE = 1.6;

function enlargeArrowheads(svg) {
  svg.querySelectorAll("marker").forEach((marker) => {
    const scaleAttrs = ["refX", "refY"];
    scaleAttrs.forEach((attr) => {
      const value = Number(marker.getAttribute(attr));
      if (!Number.isNaN(value)) {
        marker.setAttribute(attr, Math.round(value * ARROW_SCALE * 100) / 100);
      }
    });
    ["markerWidth", "markerHeight"].forEach((attr) => {
      const value = Number(marker.getAttribute(attr));
      if (!Number.isNaN(value)) {
        marker.setAttribute(attr, Math.round(value * ARROW_SCALE));
      }
    });
    // Scale the viewBox too. Flowchart markers carry a viewBox (state
    // diagram markers do not). If it stays fixed while the path grows, the
    // marker viewport clips the arrowhead and it renders half-cut.
    const viewBox = marker.getAttribute("viewBox");
    if (viewBox) {
      marker.setAttribute(
        "viewBox",
        viewBox.replace(/-?\d+(?:\.\d+)?/g, (n) =>
          String(Math.round(Number(n) * ARROW_SCALE * 100) / 100)),
      );
    }
    marker.querySelectorAll("path").forEach((path) => {
      const d = path.getAttribute("d");
      if (d) {
        path.setAttribute(
          "d",
          d.replace(/-?\d+(?:\.\d+)?/g, (n) =>
            String(Math.round(Number(n) * ARROW_SCALE * 100) / 100)),
          );
      }
    });
  });
}

// Remove layout helper nodes and their edges.
// Diagrams may declare hidden helper nodes (classDef hidden) to force the
// layering, for example to keep INIT at the top rank. Mermaid hides the
// node box, but keeps its edges. This hook removes such nodes and every
// edge that touches them, based on the endpoint data in "data-points".
function removeHelperNodes(svg) {
  const helpers = [...svg.querySelectorAll("g.node")].filter((node) =>
    node.classList.contains("hidden"),
  );
  if (helpers.length === 0) {
    return;
  }
  const centers = helpers.map((node) => {
    const transform = node.getAttribute("transform") || "";
    const match = transform.match(/translate\(\s*([-\d.]+)[ ,]+([-\d.]+)\s*\)/);
    if (!match) {
      return null;
    }
    return { x: Number(match[1]), y: Number(match[2]) };
  });
  const isHelperPoint = (point) =>
    centers.some(
      (center) =>
        center &&
        Math.abs(point.x - center.x) < 60 &&
        Math.abs(point.y - center.y) < 60,
    );
  svg.querySelectorAll("path[data-points]").forEach((path) => {
    let points;
    try {
      points = JSON.parse(atob(path.getAttribute("data-points")));
    } catch {
      return;
    }
    if (points.length > 0) {
      const first = points[0];
      const last = points[points.length - 1];
      if (isHelperPoint(first) || isHelperPoint(last)) {
        path.remove();
      }
    }
  });
  helpers.forEach((node) => node.remove());
}

const originalRender = mermaid.render.bind(mermaid);
mermaid.render = async (...args) => {
  const result = await originalRender(...args);
  const div = document.createElement("div");
  div.innerHTML = result.svg;
  const svg = div.firstElementChild;
  if (svg) {
    removeHelperNodes(svg);
    enlargeArrowheads(svg);
    result.svg = div.innerHTML;
  }
  return result;
};

// Important: necessary to make it visible to Zensical
window.mermaid = mermaid;
