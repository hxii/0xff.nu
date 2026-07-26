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
    travelerSpeed: 2.5,
    border: true,
    borderPad: 4,
    borderThickness: 1,
  };

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
          count = +lm[2],
          type = lm[3];
        for (let k = 0; k < count; k++) {
          while (i < lines.length) {
            const lr = stripComment(lines[i]).trim();
            i++;
            if (lr && lr.startsWith("-")) {
              addNode(
                {
                  type,
                  fields: lr
                    .slice(1)
                    .split(",")
                    .map((s) => s.trim()),
                },
                role,
              );
              break;
            }
          }
        }
        continue;
      }

      const sm = line.match(/^(\w+)\[\s*@(\w+)\s*\]\s*:\s*(.+)$/);
      if (sm) {
        addNode(
          { type: sm[2], fields: sm[3].split(",").map((s) => s.trim()) },
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

    const edges = [];
    if (g.center && g.parent && g.parent !== g.center) {
      edges.push([g.parent.id, g.center.id, "tree"]);
    }
    if (g.center)
      g.children.forEach((c) => edges.push([g.center.id, c.id, "tree"]));
    if (g.parent)
      g.siblings.forEach((s) => edges.push([g.parent.id, s.id, "tree"]));
    if (g.center)
      g.related.forEach((r) => edges.push([g.center.id, r.id, "related"]));

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

      edges.forEach(([aid, bid]) => {
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

    return pos;
  }

  function edges(g) {
    const e = [];
    if (g.center && g.parent && g.parent !== g.center) {
      e.push({ a: g.parent.id, b: g.center.id, kind: "tree" });
    }
    if (g.center)
      g.children.forEach((c) =>
        e.push({ a: g.center.id, b: c.id, kind: "tree" }),
      );
    if (g.parent)
      g.siblings.forEach((s) =>
        e.push({ a: g.parent.id, b: s.id, kind: "tree" }),
      );
    if (g.center)
      g.related.forEach((r) =>
        e.push({ a: g.center.id, b: r.id, kind: "related" }),
      );
    return e;
  }

  function render(container, g, cfg) {
    const pos = layout(g, cfg);
    const es = edges(g);
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
      .k-line { stroke: ${c.line}; stroke-width: 1; fill: none; opacity: .8; }
      .k-line-rel { stroke: ${c.line}; stroke-width: 1; stroke-dasharray: 1.5 2.5; fill: none; opacity: .4; }
      .k-glyph { fill: ${c.fg}; text-anchor: middle; dominant-baseline: central; }
      .k-glyph-center { fill: ${c.center}; text-anchor: middle; dominant-baseline: central; }
      .k-glyph-root { fill: ${c.muted}; text-anchor: middle; dominant-baseline: central; }
      .k-label { font-size: ${cfg.labelSize}px; fill: ${c.fg}; text-anchor: middle; dominant-baseline: hanging; }
      .k-label-muted { font-size: ${cfg.labelSize}px; fill: ${c.muted}; text-anchor: middle; dominant-baseline: hanging; }
      .k-border { fill: ${c.muted}; opacity: .6; }
      .k-traveler { fill: ${c.fg}; opacity: 0; }
      a.k-node { cursor: pointer; }
      a.k-node:hover .k-glyph, a.k-node:hover .k-glyph-center { fill: ${c.link}; }
      a.k-node:hover .k-label { fill: ${c.link}; }
      @media (prefers-reduced-motion: reduce) {
        .k-line, .k-line-rel { animation: none !important; stroke-dasharray: none; }
        .k-traveler { display: none; }
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
    es.forEach((e, idx) => {
      const a = pos[e.a],
        b = pos[e.b];
      if (!a || !b) return;
      const mx = (a.x + b.x) / 2 + (rand() - 0.5) * 20;
      const my = (a.y + b.y) / 2 + (rand() - 0.5) * 20;
      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`);
      path.setAttribute(
        "class",
        e.kind === "related" ? "k-line-rel" : "k-line",
      );
      path.setAttribute("fill", "none");

      if (cfg.animate) {
        const len = approxPathLength(a, b, mx, my);
        const dash = e.kind === "related" ? "1.5 2.5" : "4 6";
        path.setAttribute("stroke-dasharray", dash);
        const anim = document.createElementNS(ns, "animate");
        anim.setAttribute("attributeName", "stroke-dashoffset");
        anim.setAttribute("from", "0");
        anim.setAttribute("to", String(-len));
        anim.setAttribute("dur", cfg.flowSpeed + "s");
        anim.setAttribute("repeatCount", "indefinite");
        anim.setAttribute("begin", idx * 0.15 + "s");
        path.appendChild(anim);
      }

      gEdges.appendChild(path);

      if (cfg.animate && e.kind === "tree") {
        const traveler = document.createElementNS(ns, "circle");
        traveler.setAttribute("r", 1.5);
        traveler.setAttribute("class", "k-traveler");
        const motion = document.createElementNS(ns, "animateMotion");
        motion.setAttribute("dur", cfg.travelerSpeed + "s");
        motion.setAttribute("repeatCount", "indefinite");
        motion.setAttribute("begin", idx * 0.4 + "s");
        path.setAttribute("id", "k-edge-" + idx);
        const mp = document.createElementNS(ns, "mpath");
        mp.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "href",
          "#k-edge-" + idx,
        );
        motion.appendChild(mp);
        traveler.appendChild(motion);

        const fadeIn = document.createElementNS(ns, "animate");
        fadeIn.setAttribute("attributeName", "opacity");
        fadeIn.setAttribute("values", "0;1;1;0");
        fadeIn.setAttribute("keyTimes", "0;0.15;0.85;1");
        fadeIn.setAttribute("dur", cfg.travelerSpeed + "s");
        fadeIn.setAttribute("repeatCount", "indefinite");
        fadeIn.setAttribute("begin", idx * 0.4 + "s");
        traveler.appendChild(fadeIn);

        gEdges.appendChild(traveler);
      }
    });
    svg.appendChild(gEdges);

    const gNodes = document.createElementNS(ns, "g");
    const all = [
      g.center,
      g.parent,
      ...g.children,
      ...g.siblings,
      ...g.related,
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
      a.setAttribute("href", "/" + n.id);
      a.setAttribute("xlink:href", "/" + n.id);

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
