// kankei-graph.js
(function () {
  "use strict";

  const GLYPH = {
    center: "●",
    root: "▲",
    node: "▪",
  };

  // Map graph roles to your page's CSS variables.
  // The SVG inherits these from :root / .dark automatically.
  const DEFAULT_VARS = {
    fg: "var(--main-text-color, currentColor)",
    muted: "var(--dim-text-color, #888)",
    dimmer: "var(--dimmer-text-color, #aaa)",
    line: "var(--dimmest-text-color, #bbb)",
    center: "var(--theme, currentColor)",
    link: "var(--link-color, currentColor)",
  };

  const DEFAULTS = {
    colors: { ...DEFAULT_VARS },
    fontFamily:
      '"Pixel Code", ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    nodeSize: 14,
    centerSize: 22,
    labelSize: 10,
    width: 520,
    height: 320,
    labelGap: 4,
    seed: 1,
    repulsion: 1800,
    springLen: 90,
    springK: 0.04,
    centerPull: 0.01,
    damping: 0.85,
    iterations: 300,
    animate: true,
    flowSpeed: 1.2,
    border: true,
    borderPad: 4,
    borderThickness: 1,
  };

let mkSeq = 0;
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function parse(src) {
    const lines = src.split("\n");
    const out = {
      center: null,
      parent: null,
      children: [],
      siblings: [],
      related: [],
      backlinks: [],
      nodes: {},
    };

    function addNode(obj, role) {
      const id = obj.fields[0];
      if (!id) return null;
      const title = obj.fields[1] || id;
      if (!out.nodes[id]) out.nodes[id] = { id, title, role };
      else if (role === "center") out.nodes[id].role = "center";
      const n = out.nodes[id];
      if (role === "center") out.center = n;
      else if (role === "parent" && !out.parent) out.parent = n;
      else if (role === "children") out.children.push(n);
      else if (role === "siblings") out.siblings.push(n);
      else if (role === "related") out.related.push(n);
      else if (role === "backlinks") out.backlinks.push(n);
      return n;
    }

    function stripComment(line) {
      const idx = line.indexOf(" #");
      return idx >= 0 ? line.slice(0, idx) : line;
    }

    let i = 0;
    while (i < lines.length) {
      const raw = lines[i];
      const line = stripComment(raw).trim();
      i++;
      if (!line) continue;

      const tm = line.match(/^@(\w+)\s*:\s*(.+)$/);
      if (tm) continue;

      const lm = line.match(/^(\w+)\[\s*(\d+)\s*:\s*@(\w+)\s*\]\s*:\s*$/);
      if (lm) {
        const role = lm[1],
          count = +lm[2];
        for (let k = 0; k < count; k++) {
          let found = false;
          while (i < lines.length) {
            const lr = stripComment(lines[i]).trim();
            if (lr.startsWith("-")) {
              i++;
              addNode(
                {
                  fields: lr
                    .slice(1)
                    .split(",")
                    .map((s) => s.trim()),
                },
                role,
              );
              found = true;
              break;
            }
            if (lr) break; // next header / stray line: don't eat the rest
            i++; // blank line between items
          }
          if (!found) break;
        }
        continue;
      }

      const sm = line.match(/^(\w+)\[\s*@(\w+)\s*\]\s*:\s*(.+)$/);
      if (sm) {
        addNode(
          { fields: sm[3].split(",").map((s) => s.trim()) },
          sm[1],
        );
        continue;
      }
    }

    if (!out.parent && out.center) {
      const root = { id: "home", title: "Home", role: "root" };
      out.nodes[root.id] = root;
      out.parent = root;
    }

    return out;
  }

  function layout(g, cfg) {
    const W = cfg.width,
      H = cfg.height;
    const cx = W / 2,
      cy = H / 2;
    const m = cfg.border ? cfg.borderPad + cfg.borderThickness + 20 : 40;

    const all = [];
    const seen = new Set();
    function add(n) {
      if (n && !seen.has(n.id)) {
        seen.add(n.id);
        all.push(n);
      }
    }
    add(g.center);
    add(g.parent);
    g.children.forEach(add);
    g.siblings.forEach(add);
    g.related.forEach(add);
    g.backlinks.forEach(add);

    const es = buildEdges(g);

    const pos = {};
    const vel = {};
    const rand = rng(cfg.seed);

    all.forEach((n) => {
      if (n === g.center) {
        pos[n.id] = { x: cx, y: cy };
      } else {
        const a = rand() * Math.PI * 2;
        const r = 60 + rand() * 80;
        pos[n.id] = { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
      }
      vel[n.id] = { x: 0, y: 0 };
    });

    for (let iter = 0; iter < cfg.iterations; iter++) {
      const cooling = 1 - iter / cfg.iterations;

      for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
          const a = all[i],
            b = all[j];
          const dx = pos[b.id].x - pos[a.id].x;
          const dy = pos[b.id].y - pos[a.id].y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.01) dist = 0.01;
          const force = cfg.repulsion / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          vel[a.id].x -= fx;
          vel[a.id].y -= fy;
          vel[b.id].x += fx;
          vel[b.id].y += fy;
        }
      }

      es.forEach((e) => {
        const aid = e.a,
          bid = e.b;
        const a = pos[aid],
          b = pos[bid];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const stretch = dist - cfg.springLen;
        const fx = (dx / dist) * stretch * cfg.springK;
        const fy = (dy / dist) * stretch * cfg.springK;
        vel[aid].x += fx;
        vel[aid].y += fy;
        vel[bid].x -= fx;
        vel[bid].y -= fy;
      });

      all.forEach((n) => {
        if (n === g.center) return;
        vel[n.id].x += (cx - pos[n.id].x) * cfg.centerPull;
        vel[n.id].y += (cy - pos[n.id].y) * cfg.centerPull;
      });

      all.forEach((n) => {
        if (n === g.center) return;
        vel[n.id].x *= cfg.damping * cooling;
        vel[n.id].y *= cfg.damping * cooling;
        pos[n.id].x += vel[n.id].x;
        pos[n.id].y += vel[n.id].y;
        pos[n.id].x = Math.max(m, Math.min(W - m, pos[n.id].x));
        pos[n.id].y = Math.max(m + cfg.labelSize, Math.min(H - m, pos[n.id].y));
      });
    }

    return { pos, edges: es };
  }

  // ponytail: dedup by unordered pair so a node listed in two roles
  // (e.g. a child that's also a sibling) draws one line, not two.
  // a->b encodes flow direction: the dash animation runs from a to b,
  // so "inward" edges (backlinks) are flipped to point at the center.
  function buildEdges(g) {
    const e = [];
    const seen = new Set();
    const add = (x, y, kind) => {
      if (!x || !y || x === y) return;
      const key = x.id < y.id ? x.id + "|" + y.id : y.id + "|" + x.id;
      if (seen.has(key)) return;
      seen.add(key);
      e.push({ a: x.id, b: y.id, kind });
    };
    add(g.center, g.parent, "tree-up");
    if (g.center) g.children.forEach((c) => add(g.center, c, "tree-down"));
    if (g.parent) g.siblings.forEach((s) => add(g.parent, s, "tree-sib"));
    if (g.center) g.related.forEach((r) => add(g.center, r, "related"));
    if (g.center) g.backlinks.forEach((b) => add(b, g.center, "backlink"));
    return e;
  }

  function render(container, g, cfg) {
    const { pos, edges: es } = layout(g, cfg);
    const W = cfg.width,
      H = cfg.height;

    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    svg.setAttribute("role", "navigation");
    svg.setAttribute("aria-label", "Note relationships");
    svg.style.display = "block";
    svg.style.maxWidth = "100%";
    svg.style.height = "auto";

    const ff = cfg.fontFamily;
    const c = cfg.colors;

    const style = document.createElementNS(ns, "style");
    style.textContent = `
      svg { shape-rendering: crispEdges; }
      text { font-family: ${ff}; text-transform: uppercase; }
      .k-edge { fill: none; stroke-width: 1; }
      .k-tree-up { stroke: ${c.muted}; opacity: .8; }
      .k-tree-down { stroke: ${c.fg}; opacity: .9; }
      .k-tree-sib { stroke: ${c.dimmer}; opacity: .7; }
      .k-related { stroke: ${c.muted}; opacity: .4; }
      .k-backlink { stroke: ${c.link}; opacity: .5; }
      .k-glyph { fill: ${c.fg}; text-anchor: middle; dominant-baseline: central; }
      .k-glyph-center { fill: ${c.center}; text-anchor: middle; dominant-baseline: central; }
      .k-glyph-root { fill: ${c.muted}; text-anchor: middle; dominant-baseline: central; }
      .k-label { font-size: ${cfg.labelSize}px; fill: ${c.fg}; text-anchor: middle; dominant-baseline: hanging; }
      .k-label-muted { font-size: ${cfg.labelSize}px; fill: ${c.muted}; text-anchor: middle; dominant-baseline: hanging; }
      .k-border { fill: ${c.muted}; opacity: .6; }
      a.k-node { cursor: pointer; }
      a.k-node:hover .k-glyph, a.k-node:hover .k-glyph-center { fill: ${c.link}; }
      a.k-node:hover .k-label { fill: ${c.link}; }
      .k-edge.k-hi { opacity: 1 !important; stroke-width: 1.5; }
      .k-edge.k-lo { opacity: .12 !important; }
      @media (prefers-reduced-motion: reduce) {
        .k-edge { animation: none !important; stroke-dasharray: none; }
      }
    `;
    svg.appendChild(style);

    if (cfg.border) {
      const border = document.createElementNS(ns, "g");
      border.setAttribute("class", "k-border");
      const p = cfg.borderPad;
      const t = cfg.borderThickness;
      const x0 = Math.round(p);
      const y0 = Math.round(p);
      const x1 = Math.round(W - p);
      const y1 = Math.round(H - p);

      const top = document.createElementNS(ns, "rect");
      top.setAttribute("x", x0);
      top.setAttribute("y", y0);
      top.setAttribute("width", x1 - x0);
      top.setAttribute("height", t);
      border.appendChild(top);

      const bot = document.createElementNS(ns, "rect");
      bot.setAttribute("x", x0);
      bot.setAttribute("y", y1 - t);
      bot.setAttribute("width", x1 - x0);
      bot.setAttribute("height", t);
      border.appendChild(bot);

      const left = document.createElementNS(ns, "rect");
      left.setAttribute("x", x0);
      left.setAttribute("y", y0);
      left.setAttribute("width", t);
      left.setAttribute("height", y1 - y0);
      border.appendChild(left);

      const right = document.createElementNS(ns, "rect");
      right.setAttribute("x", x1 - t);
      right.setAttribute("y", y0);
      right.setAttribute("width", t);
      right.setAttribute("height", y1 - y0);
      border.appendChild(right);

      svg.appendChild(border);
    }

    const gEdges = document.createElementNS(ns, "g");
    const rand = rng(cfg.seed + 7);
    // closer relationships flow faster; distant ones drift. Dash pattern
    // encodes type: solid-ish for tree, dots for related, short for backlink.
    const speedMul = {
      "tree-down": 0.8,
      "tree-up": 1,
      "tree-sib": 1.3,
      backlink: 1.5,
      related: 1.8,
    };
    es.forEach((e, idx) => {
      const a = pos[e.a],
        b = pos[e.b];
      if (!a || !b) return;
      const mx = (a.x + b.x) / 2 + (rand() - 0.5) * 20;
      const my = (a.y + b.y) / 2 + (rand() - 0.5) * 20;
      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`);
      path.setAttribute("class", "k-edge k-" + e.kind);
      path.setAttribute("data-a", e.a);
      path.setAttribute("data-b", e.b);
      path.setAttribute("fill", "none");
      path.setAttribute(
        "stroke-dasharray",
        e.kind === "related" ? "1.5 2.5" : e.kind === "backlink" ? "2 3" : "4 6",
      );

      if (cfg.animate) {
        const len = approxPathLength(a, b, mx, my);
        const anim = document.createElementNS(ns, "animate");
        anim.setAttribute("attributeName", "stroke-dashoffset");
        anim.setAttribute("from", "0");
        anim.setAttribute("to", String(-len));
        anim.setAttribute(
          "dur",
          (cfg.flowSpeed * (speedMul[e.kind] || 1)).toFixed(2) + "s",
        );
        anim.setAttribute("repeatCount", "indefinite");
        anim.setAttribute("begin", idx * 0.15 + "s");
        path.appendChild(anim);
      }

      gEdges.appendChild(path);
    });
    svg.appendChild(gEdges);

    const gNodes = document.createElementNS(ns, "g");
    const all = [
      g.center,
      g.parent,
      ...g.children,
      ...g.siblings,
      ...g.related,
      ...g.backlinks,
    ].filter(Boolean);
    const seen = new Set();
    all.forEach((n) => {
      if (seen.has(n.id)) return;
      seen.add(n.id);
      const p = pos[n.id];
      if (!p) return;

      const isRoot = n.role === "root" || n.role === "parent";

      const a = document.createElementNS(ns, "a");
      a.setAttribute("class", "k-node");
      a.setAttribute("data-id", n.id);
      a.setAttribute("href", n.id === "home" ? "/" : "/" + n.id);

      const glyph = document.createElementNS(ns, "text");
      glyph.setAttribute("x", p.x);
      glyph.setAttribute("y", p.y);
      const size = n.role === "center" ? cfg.centerSize : cfg.nodeSize;
      glyph.setAttribute("font-size", size + "px");
      glyph.setAttribute(
        "class",
        n.role === "center"
          ? "k-glyph-center"
          : isRoot
            ? "k-glyph-root"
            : "k-glyph",
      );
      glyph.textContent =
        n.role === "center" ? GLYPH.center : isRoot ? GLYPH.root : GLYPH.node;
      a.appendChild(glyph);

      const label = document.createElementNS(ns, "text");
      label.setAttribute("x", p.x);
      label.setAttribute("y", p.y + size / 2 + cfg.labelGap);
      label.setAttribute("class", isRoot ? "k-label-muted" : "k-label");
      label.textContent = n.title;
      a.appendChild(label);
      a.addEventListener("mouseenter", () => {
        gEdges.querySelectorAll(".k-edge").forEach((p) => {
          const hi =
            p.getAttribute("data-a") === n.id ||
            p.getAttribute("data-b") === n.id;
          p.classList.toggle("k-hi", hi);
          p.classList.toggle("k-lo", !hi);
        });
      });
      a.addEventListener("mouseleave", () => {
        gEdges.querySelectorAll(".k-hi,.k-lo").forEach((p) =>
          p.classList.remove("k-hi", "k-lo"),
        );
      });

      gNodes.appendChild(a);
    });
    svg.appendChild(gNodes);

    container.appendChild(svg);
    return {
      svg,
      destroy() {
        if (svg.parentNode) svg.parentNode.removeChild(svg);
      },
    };
  }

  function approxPathLength(a, b, mx, my) {
    const seg1 = Math.hypot(mx - a.x, my - a.y);
    const seg2 = Math.hypot(b.x - mx, b.y - my);
    return (seg1 + seg2) * 1.05;
  }

  function create(container, config) {
    const el =
      typeof container === "string"
        ? document.querySelector(container)
        : container;
    if (!el) throw new Error("kankei: container not found");
    const cfg = Object.assign({}, DEFAULTS, config || {});
    cfg.colors = Object.assign({}, DEFAULT_VARS, config?.colors || {});
    const g = parse(config.nodeMap || "");
    return render(el, g, cfg);
  }

  if (typeof window !== "undefined") window.kankei = { create };
  if (typeof module !== "undefined") module.exports = { create };
})();
