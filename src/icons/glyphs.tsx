/**
 * Hosted icon paths — original drawings for Executive Angler.
 * 1.5px stroke, slightly inked. Each mark is drawn at 16 / 20 / 24,
 * not one 24-unit path scaled three ways.
 */

import type { ReactNode } from "react";
import type { IconName } from "./names";

export type Optical = 16 | 20 | 24;

export type GlyphRender = (s: Optical, filled: boolean) => ReactNode;

function m(s: Optical, a: number, b: number, c: number): number {
  return s === 16 ? a : s === 20 ? b : c;
}

function path(d: string, key: string, fill = false): ReactNode {
  return <path key={key} d={d} fill={fill ? "currentColor" : "none"} />;
}

function dot(cx: number, cy: number, r: number, key: string, live = false): ReactNode {
  return (
    <circle
      key={key}
      cx={cx}
      cy={cy}
      r={r}
      fill={live ? "var(--signal-live)" : "currentColor"}
      stroke="none"
    />
  );
}

/* ── Desk metaphors ─────────────────────────────────────────────── */

const gauge: GlyphRender = (s) => {
  const cx = s / 2;
  const cy = s / 2 + m(s, 1.2, 1.4, 1.6);
  const r = m(s, 5.2, 6.6, 8);
  const start = Math.PI * 0.85;
  const end = Math.PI * 0.15;
  const arc = (from: number, to: number) => {
    const x1 = cx + r * Math.cos(from);
    const y1 = cy - r * Math.sin(from);
    const x2 = cx + r * Math.cos(to);
    const y2 = cy - r * Math.sin(to);
    return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 1 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };
  const ticks: ReactNode[] = [];
  const tickCount = s === 16 ? 3 : s === 20 ? 4 : 5;
  for (let i = 0; i < tickCount; i++) {
    const t = start + ((end + Math.PI * 2 - start) % (Math.PI * 2)) * (i / (tickCount - 1));
    const ang = start + (Math.PI * 1.3 * i) / (tickCount - 1);
    const inner = r - m(s, 1.4, 1.6, 1.8);
    const x1 = cx + inner * Math.cos(ang);
    const y1 = cy - inner * Math.sin(ang);
    const x2 = cx + r * Math.cos(ang);
    const y2 = cy - r * Math.sin(ang);
    ticks.push(path(`M${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)}`, `t${i}`));
    void t;
  }
  const needle = m(s, 4.2, 5.4, 6.6);
  const nAng = Math.PI * 0.35;
  return (
    <>
      {path(arc(start, end), "arc")}
      {ticks}
      {path(
        `M${cx} ${cy} L${(cx + needle * Math.cos(nAng)).toFixed(2)} ${(cy - needle * Math.sin(nAng)).toFixed(2)}`,
        "needle",
      )}
      {dot(cx, cy, m(s, 1.05, 1.2, 1.35), "hub")}
    </>
  );
};

const current: GlyphRender = (s) => {
  const y1 = s * 0.38;
  const y2 = s * 0.62;
  const x0 = m(s, 2.5, 3, 3.5);
  const x1 = s - x0;
  const c = s * 0.25;
  return (
    <>
      {path(`M${x0} ${y1} C${x0 + c} ${y1 - c * 0.55}, ${x1 - c} ${y1 + c * 0.55}, ${x1} ${y1}`, "a")}
      {path(`M${x0} ${y2} C${x0 + c} ${y2 + c * 0.55}, ${x1 - c} ${y2 - c * 0.55}, ${x1} ${y2}`, "b")}
      {s >= 20
        ? path(
            `M${s / 2 - m(s, 0, 1.2, 1.6)} ${s / 2} L${s / 2 + m(s, 0, 1.2, 1.6)} ${s / 2}`,
            "seam",
          )
        : null}
      {dot(s / 2, s / 2, m(s, 0.9, 1.05, 1.2), "meet")}
    </>
  );
};

const hackle: GlyphRender = (s) => {
  const mid = s / 2;
  const top = m(s, 2.8, 3.2, 3.6);
  const bot = s - m(s, 2.6, 3, 3.4);
  const pairs = s === 16 ? 2 : 3;
  const fibers: ReactNode[] = [];
  for (let i = 0; i < pairs; i++) {
    const y = top + ((bot - top) * (i + 0.55)) / (pairs + 0.2);
    const span = m(s, 4.2, 5.4, 6.6) * (1 - i * 0.12);
    fibers.push(path(`M${mid} ${y} L${mid - span} ${y - m(s, 1.6, 2, 2.4)}`, `l${i}`));
    fibers.push(path(`M${mid} ${y} L${mid + span} ${y - m(s, 1.6, 2, 2.4)}`, `r${i}`));
  }
  return (
    <>
      {path(`M${mid} ${top} V${bot}`, "stem")}
      {fibers}
      {dot(mid, bot, m(s, 0.95, 1.1, 1.25), "butt")}
    </>
  );
};

const bookmark: GlyphRender = (s, filled) => {
  const x = m(s, 4.2, 5.2, 6.2);
  const top = m(s, 2.4, 2.8, 3.2);
  const bot = s - m(s, 2.2, 2.6, 3);
  const notch = m(s, 3.4, 4.2, 5);
  return path(
    `M${x} ${top} H${s - x} V${bot} L${s / 2} ${bot - notch} L${x} ${bot} Z`,
    "mark",
    filled,
  );
};

const hook: GlyphRender = (s) => {
  const x = s * 0.38;
  const top = m(s, 3.2, 3.6, 4);
  const bendY = s - m(s, 3.8, 4.4, 5);
  const r = m(s, 3.6, 4.6, 5.6);
  const eyeR = m(s, 1.15, 1.35, 1.55);
  const barb =
    s >= 20
      ? path(
          `M${x + r * 0.15} ${bendY + r * 0.35} L${x + r * 0.55} ${bendY + r * 0.05}`,
          "barb",
        )
      : null;
  return (
    <>
      <circle key="eye" cx={x} cy={top} r={eyeR} fill="none" />
      {path(`M${x} ${top + eyeR} V${bendY}`, "shank")}
      {path(
        `M${x} ${bendY} A${r} ${r} 0 0 0 ${x + r * 1.55} ${bendY - r * 0.15}`,
        "bend",
      )}
      {barb}
      {dot(x, top, m(s, 0.55, 0.65, 0.75), "eye-ink")}
    </>
  );
};

const vise: GlyphRender = (s) => {
  const mid = s / 2;
  const jaw = m(s, 3.2, 4, 4.8);
  const top = m(s, 3.2, 3.8, 4.4);
  const stemB = s - m(s, 2.8, 3.2, 3.6);
  return (
    <>
      {path(`M${mid - jaw} ${top} H${mid + jaw}`, "top")}
      {path(`M${mid - jaw} ${top + m(s, 2.4, 3, 3.6)} H${mid + jaw}`, "bot")}
      {path(`M${mid - jaw} ${top} V${top + m(s, 2.4, 3, 3.6)}`, "l")}
      {path(`M${mid + jaw} ${top} V${top + m(s, 2.4, 3, 3.6)}`, "r")}
      {path(`M${mid} ${top + m(s, 2.4, 3, 3.6)} V${stemB}`, "stem")}
      {dot(mid, stemB, m(s, 1.15, 1.35, 1.55), "screw")}
    </>
  );
};

const hatch: GlyphRender = (s) => {
  const p = m(s, 3, 3.5, 4);
  const cell = (s - p * 2) / (s === 16 ? 2 : 3);
  const cols = s === 16 ? 2 : 3;
  const rows = s === 16 ? 2 : 3;
  const nodes: ReactNode[] = [path(`M${p} ${p} H${s - p} V${s - p} H${p} Z`, "frame")];
  for (let i = 1; i < cols; i++) {
    nodes.push(path(`M${p + cell * i} ${p} V${s - p}`, `c${i}`));
  }
  for (let j = 1; j < rows; j++) {
    nodes.push(path(`M${p} ${p + cell * j} H${s - p}`, `r${j}`));
  }
  const ink = s === 16 ? { x: p + cell * 0.2, y: p + cell * 1.2, w: cell * 0.6, h: cell * 0.6 } : { x: p + cell * 1.2, y: p + cell * 1.2, w: cell * 0.6, h: cell * 0.6 };
  nodes.push(
    <rect
      key="ink"
      x={ink.x}
      y={ink.y}
      width={ink.w}
      height={ink.h}
      fill="currentColor"
      stroke="none"
    />,
  );
  return <>{nodes}</>;
};

const lock: GlyphRender = (s) => {
  const bodyTop = m(s, 7.2, 8.8, 10.4);
  const x = m(s, 4, 4.6, 5.2);
  const w = s - x * 2;
  const h = s - bodyTop - m(s, 2.4, 2.8, 3.2);
  const shackleR = m(s, 2.6, 3.3, 4);
  const cx = s / 2;
  return (
    <>
      {path(
        `M${cx - shackleR} ${bodyTop} V${bodyTop - shackleR * 0.35} A${shackleR} ${shackleR} 0 0 1 ${cx + shackleR} ${bodyTop - shackleR * 0.35} V${bodyTop}`,
        "shackle",
      )}
      {path(`M${x} ${bodyTop} H${x + w} V${bodyTop + h} H${x} Z`, "body")}
      {dot(cx, bodyTop + h * 0.48, m(s, 0.85, 1, 1.15), "keyhole")}
    </>
  );
};

const map: GlyphRender = (s) => {
  const p = m(s, 2.8, 3.4, 4);
  const fold = m(s, 4.2, 5.2, 6.2);
  return (
    <>
      {path(`M${p + 1} ${p} L${s - p} ${p + 1.2} L${s - p - 1} ${s - p} L${p} ${s - p - 1.2} Z`, "sheet")}
      {path(`M${p + fold} ${p + 0.4} L${p + fold - 0.8} ${s - p - 0.6}`, "crease")}
      {s >= 20 ? path(`M${s / 2 + 0.5} ${p + 2} L${s / 2 - 0.4} ${s - p - 2}`, "fold2") : null}
      {path(
        `M${s * 0.62} ${s * 0.42} L${s * 0.72} ${s * 0.52} M${s * 0.72} ${s * 0.42} L${s * 0.62} ${s * 0.52}`,
        "survey",
      )}
      {dot(s * 0.67, s * 0.47, m(s, 0.55, 0.65, 0.75), "ink")}
    </>
  );
};

const rule: GlyphRender = (s) => {
  const y = s / 2;
  const x0 = m(s, 2.2, 2.6, 3);
  const x1 = s - x0;
  const ticks: ReactNode[] = [path(`M${x0} ${y} H${x1}`, "beam")];
  const n = s === 16 ? 5 : s === 20 ? 7 : 9;
  for (let i = 0; i < n; i++) {
    const x = x0 + ((x1 - x0) * i) / (n - 1);
    const h = i % 2 === 0 ? m(s, 3.2, 3.8, 4.4) : m(s, 2, 2.4, 2.8);
    ticks.push(path(`M${x} ${y - h / 2} V${y + h / 2}`, `t${i}`));
  }
  return <>{ticks}</>;
};

const notebook: GlyphRender = (s) => {
  const p = m(s, 3.2, 3.8, 4.4);
  const spine = p + m(s, 2, 2.4, 2.8);
  const lineY = (i: number) => p + m(s, 4.2, 5, 5.8) + i * m(s, 2.6, 3.1, 3.6);
  const lines = s === 16 ? 2 : 3;
  return (
    <>
      {path(`M${p} ${p} H${s - p} V${s - p} H${p} Z`, "cover")}
      {path(`M${spine} ${p} V${s - p}`, "spine")}
      {Array.from({ length: lines }, (_, i) =>
        path(`M${spine + m(s, 1.4, 1.6, 1.8)} ${lineY(i)} H${s - p - m(s, 1.6, 1.8, 2)}`, `l${i}`),
      )}
    </>
  );
};

/* ── Chrome ─────────────────────────────────────────────────────── */

const plus: GlyphRender = (s) => {
  const pad = m(s, 3.5, 4.5, 5.5);
  const mid = s / 2;
  return (
    <>
      {path(`M${pad} ${mid} H${s - pad}`, "h")}
      {path(`M${mid} ${pad} V${s - pad}`, "v")}
    </>
  );
};

const minus: GlyphRender = (s) => {
  const pad = m(s, 3.5, 4.5, 5.5);
  return path(`M${pad} ${s / 2} H${s - pad}`, "h");
};

const close: GlyphRender = (s) => {
  const pad = m(s, 4, 5, 6);
  return (
    <>
      {path(`M${pad} ${pad} L${s - pad} ${s - pad}`, "a")}
      {path(`M${s - pad} ${pad} L${pad} ${s - pad}`, "b")}
    </>
  );
};

const check: GlyphRender = (s) => {
  const x0 = m(s, 3.2, 4, 4.8);
  const y0 = s * 0.52;
  const x1 = s * 0.42;
  const y1 = s - m(s, 4.2, 5, 5.8);
  const x2 = s - m(s, 3.2, 4, 4.8);
  const y2 = m(s, 4.2, 5, 5.8);
  return (
    <>
      {path(`M${x0} ${y0} L${x1} ${y1} L${x2} ${y2}`, "tick")}
      {dot(x2, y2, m(s, 0.7, 0.8, 0.9), "end")}
    </>
  );
};

const checkDouble: GlyphRender = (s) => (
  <>
    {path(
      `M${m(s, 2.2, 2.6, 3)} ${s * 0.52} L${s * 0.32} ${s - m(s, 4.6, 5.4, 6.2)} L${s * 0.62} ${m(s, 4.4, 5.2, 6)}`,
      "a",
    )}
    {path(
      `M${s * 0.42} ${s * 0.58} L${s * 0.55} ${s - m(s, 4.2, 5, 5.8)} L${s - m(s, 2.4, 2.8, 3.2)} ${m(s, 4.2, 5, 5.8)}`,
      "b",
    )}
  </>
);

const search: GlyphRender = (s) => {
  const cx = s * 0.44;
  const cy = s * 0.44;
  const r = m(s, 4.2, 5.2, 6.2);
  return (
    <>
      <circle key="rim" cx={cx} cy={cy} r={r} fill="none" />
      {path(
        `M${cx + r * 0.72} ${cy + r * 0.72} L${s - m(s, 2.6, 3, 3.4)} ${s - m(s, 2.6, 3, 3.4)}`,
        "handle",
      )}
      {dot(cx, cy, m(s, 0.7, 0.8, 0.95), "lens")}
    </>
  );
};

const menu: GlyphRender = (s) => {
  const x0 = m(s, 3.2, 4, 4.8);
  const x1 = s - x0;
  const y = (i: number) => m(s, 4.6, 5.6, 6.6) + i * m(s, 3.4, 4.2, 5);
  return (
    <>
      {path(`M${x0} ${y(0)} H${x1}`, "a")}
      {path(`M${x0} ${y(1)} H${x1 - m(s, 2.2, 2.8, 3.4)}`, "b")}
      {path(`M${x0} ${y(2)} H${x1 - m(s, 4.4, 5.6, 6.8)}`, "c")}
    </>
  );
};

function chevron(dir: "left" | "right" | "up" | "down"): GlyphRender {
  return (s) => {
    const pad = m(s, 5, 6, 7);
    const mid = s / 2;
    if (dir === "right") return path(`M${pad} ${pad} L${s - pad} ${mid} L${pad} ${s - pad}`, "c");
    if (dir === "left") return path(`M${s - pad} ${pad} L${pad} ${mid} L${s - pad} ${s - pad}`, "c");
    if (dir === "up") return path(`M${pad} ${s - pad} L${mid} ${pad} L${s - pad} ${s - pad}`, "c");
    return path(`M${pad} ${pad} L${mid} ${s - pad} L${s - pad} ${pad}`, "c");
  };
}

const arrowLeft: GlyphRender = (s) => {
  const y = s / 2;
  const x0 = m(s, 3.2, 4, 4.8);
  const x1 = s - x0;
  return (
    <>
      {path(`M${x1} ${y} H${x0}`, "shaft")}
      {path(`M${x0 + m(s, 3.4, 4.2, 5)} ${y - m(s, 3.2, 4, 4.8)} L${x0} ${y} L${x0 + m(s, 3.4, 4.2, 5)} ${y + m(s, 3.2, 4, 4.8)}`, "head")}
    </>
  );
};

const arrowRight: GlyphRender = (s) => {
  const y = s / 2;
  const x0 = m(s, 3.2, 4, 4.8);
  const x1 = s - x0;
  return (
    <>
      {path(`M${x0} ${y} H${x1}`, "shaft")}
      {path(`M${x1 - m(s, 3.4, 4.2, 5)} ${y - m(s, 3.2, 4, 4.8)} L${x1} ${y} L${x1 - m(s, 3.4, 4.2, 5)} ${y + m(s, 3.2, 4, 4.8)}`, "head")}
    </>
  );
};

const arrowUpRight: GlyphRender = (s) => {
  const p = m(s, 4.2, 5.2, 6.2);
  return (
    <>
      {path(`M${p} ${s - p} L${s - p} ${p}`, "shaft")}
      {path(`M${s - p - m(s, 4, 5, 6)} ${p} H${s - p} V${p + m(s, 4, 5, 6)}`, "head")}
    </>
  );
};

const sort: GlyphRender = (s) => {
  const mid = s / 2;
  const p = m(s, 3.4, 4.2, 5);
  return (
    <>
      {path(`M${mid} ${p} V${s - p}`, "shaft")}
      {path(`M${mid - m(s, 2.6, 3.2, 3.8)} ${p + m(s, 3, 3.6, 4.2)} L${mid} ${p} L${mid + m(s, 2.6, 3.2, 3.8)} ${p + m(s, 3, 3.6, 4.2)}`, "up")}
      {path(`M${mid - m(s, 2.6, 3.2, 3.8)} ${s - p - m(s, 3, 3.6, 4.2)} L${mid} ${s - p} L${mid + m(s, 2.6, 3.2, 3.8)} ${s - p - m(s, 3, 3.6, 4.2)}`, "dn")}
    </>
  );
};

const swap: GlyphRender = (s) => {
  const y1 = s * 0.36;
  const y2 = s * 0.64;
  const x0 = m(s, 3, 3.6, 4.2);
  const x1 = s - x0;
  const h = m(s, 2.4, 3, 3.6);
  return (
    <>
      {path(`M${x0} ${y1} H${x1}`, "a")}
      {path(`M${x1 - h} ${y1 - h} L${x1} ${y1} L${x1 - h} ${y1 + h}`, "ah")}
      {path(`M${x1} ${y2} H${x0}`, "b")}
      {path(`M${x0 + h} ${y2 - h} L${x0} ${y2} L${x0 + h} ${y2 + h}`, "bh")}
    </>
  );
};

const external: GlyphRender = (s) => {
  const p = m(s, 3.4, 4.2, 5);
  const box = s - p - m(s, 1.6, 2, 2.4);
  return (
    <>
      {path(`M${p} ${p + m(s, 3.2, 4, 4.8)} V${s - p} H${box} V${p + m(s, 3.2, 4, 4.8)}`, "box")}
      {path(`M${s * 0.48} ${s * 0.48} L${s - p} ${p}`, "go")}
      {path(`M${s - p - m(s, 3.6, 4.4, 5.2)} ${p} H${s - p} V${p + m(s, 3.6, 4.4, 5.2)}`, "head")}
    </>
  );
};

const send: GlyphRender = (s) => {
  const p = m(s, 3, 3.6, 4.2);
  return (
    <>
      {path(`M${p} ${p} L${s - p} ${s / 2} L${p} ${s - p} L${p + m(s, 3.6, 4.4, 5.2)} ${s / 2} Z`, "paper")}
      {dot(s - p, s / 2, m(s, 0.7, 0.8, 0.9), "tip")}
    </>
  );
};

const download: GlyphRender = (s) => {
  const mid = s / 2;
  const p = m(s, 3.4, 4.2, 5);
  return (
    <>
      {path(`M${mid} ${p} V${s - p - m(s, 2.2, 2.6, 3)}`, "shaft")}
      {path(
        `M${mid - m(s, 3.2, 4, 4.8)} ${s * 0.52} L${mid} ${s - p - m(s, 2.2, 2.6, 3)} L${mid + m(s, 3.2, 4, 4.8)} ${s * 0.52}`,
        "head",
      )}
      {path(`M${p} ${s - p} H${s - p}`, "tray")}
    </>
  );
};

const upload: GlyphRender = (s) => {
  const mid = s / 2;
  const p = m(s, 3.4, 4.2, 5);
  return (
    <>
      {path(`M${mid} ${s - p - m(s, 1.2, 1.4, 1.6)} V${p + m(s, 2.2, 2.6, 3)}`, "shaft")}
      {path(
        `M${mid - m(s, 3.2, 4, 4.8)} ${p + m(s, 5.4, 6.6, 7.8)} L${mid} ${p + m(s, 2.2, 2.6, 3)} L${mid + m(s, 3.2, 4, 4.8)} ${p + m(s, 5.4, 6.6, 7.8)}`,
        "head",
      )}
      {path(`M${p} ${s - p} H${s - p}`, "tray")}
    </>
  );
};

const loader: GlyphRender = (s) => {
  const r = m(s, 5.2, 6.4, 7.6);
  const cx = s / 2;
  const cy = s / 2;
  return (
    <>
      {path(
        `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx - r * 0.85} ${cy + r * 0.5}`,
        "arc",
      )}
      {dot(cx, cy - r, m(s, 0.85, 1, 1.15), "head")}
    </>
  );
};

const camera: GlyphRender = (s) => {
  const p = m(s, 2.8, 3.4, 4);
  const top = p + m(s, 2.2, 2.6, 3);
  return (
    <>
      {path(`M${p} ${top} H${s - p} V${s - p} H${p} Z`, "body")}
      {path(`M${s * 0.36} ${top} V${p} H${s * 0.64} V${top}`, "hood")}
      <circle key="lens" cx={s / 2} cy={(top + s - p) / 2} r={m(s, 2.2, 2.8, 3.4)} fill="none" />
      {dot(s / 2, (top + s - p) / 2, m(s, 0.7, 0.85, 1), "hub")}
    </>
  );
};

const aperture: GlyphRender = (s) => {
  const r = m(s, 5.4, 6.8, 8.2);
  const cx = s / 2;
  const cy = s / 2;
  const blades = s === 16 ? 4 : 6;
  const nodes: ReactNode[] = [<circle key="rim" cx={cx} cy={cy} r={r} fill="none" />];
  for (let i = 0; i < blades; i++) {
    const a = (Math.PI * 2 * i) / blades - Math.PI / 2;
    nodes.push(
      path(
        `M${cx} ${cy} L${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`,
        `b${i}`,
      ),
    );
  }
  nodes.push(dot(cx, cy, m(s, 0.85, 1, 1.15), "hub"));
  return <>{nodes}</>;
};

const heart: GlyphRender = (s, filled) => {
  const d =
    s === 16
      ? "M8 13.4 C8 13.4 3.2 10.2 3.2 6.8 C3.2 5 4.6 3.8 6.2 3.8 C7.2 3.8 8 4.4 8 4.4 C8 4.4 8.8 3.8 9.8 3.8 C11.4 3.8 12.8 5 12.8 6.8 C12.8 10.2 8 13.4 8 13.4Z"
      : s === 20
        ? "M10 16.8 C10 16.8 3.8 12.6 3.8 8.3 C3.8 6.1 5.6 4.6 7.6 4.6 C8.9 4.6 10 5.4 10 5.4 C10 5.4 11.1 4.6 12.4 4.6 C14.4 4.6 16.2 6.1 16.2 8.3 C16.2 12.6 10 16.8 10 16.8Z"
        : "M12 20.2 C12 20.2 4.4 15.2 4.4 9.8 C4.4 7.2 6.6 5.4 9 5.4 C10.6 5.4 12 6.4 12 6.4 C12 6.4 13.4 5.4 15 5.4 C17.4 5.4 19.6 7.2 19.6 9.8 C19.6 15.2 12 20.2 12 20.2Z";
  return path(d, "h", filled);
};

const star: GlyphRender = (s, filled) => {
  const cx = s / 2;
  const cy = s / 2;
  const outer = m(s, 5.4, 6.8, 8.2);
  const inner = outer * 0.4;
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const ang = (Math.PI / 4) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    pts.push(`${(cx + r * Math.cos(ang)).toFixed(2)} ${(cy + r * Math.sin(ang)).toFixed(2)}`);
  }
  return path(`M${pts[0]} L${pts.slice(1).join(" L")} Z`, "star", filled);
};

const bell: GlyphRender = (s) => {
  const cx = s / 2;
  const top = m(s, 3.4, 4, 4.6);
  return (
    <>
      {path(
        `M${cx - m(s, 4.2, 5.2, 6.2)} ${s * 0.62} C${cx - m(s, 4.2, 5.2, 6.2)} ${s * 0.38}, ${cx - m(s, 2.4, 3, 3.6)} ${top}, ${cx} ${top} C${cx + m(s, 2.4, 3, 3.6)} ${top}, ${cx + m(s, 4.2, 5.2, 6.2)} ${s * 0.38}, ${cx + m(s, 4.2, 5.2, 6.2)} ${s * 0.62} H${cx - m(s, 4.2, 5.2, 6.2)}`,
        "body",
      )}
      {path(`M${cx - m(s, 1.2, 1.4, 1.6)} ${s - m(s, 3.2, 3.8, 4.4)} A${m(s, 1.2, 1.4, 1.6)} ${m(s, 1.2, 1.4, 1.6)} 0 0 0 ${cx + m(s, 1.2, 1.4, 1.6)} ${s - m(s, 3.2, 3.8, 4.4)}`, "clapper")}
      {dot(cx, top, m(s, 0.7, 0.8, 0.9), "crown")}
    </>
  );
};

const message: GlyphRender = (s) => {
  const p = m(s, 2.8, 3.4, 4);
  return (
    <>
      {path(`M${p} ${p + m(s, 1.6, 2, 2.4)} H${s - p} V${s - p - m(s, 1.2, 1.4, 1.6)} H${p} Z`, "env")}
      {path(`M${p} ${p + m(s, 1.6, 2, 2.4)} L${s / 2} ${s * 0.55} L${s - p} ${p + m(s, 1.6, 2, 2.4)}`, "flap")}
    </>
  );
};

const angler: GlyphRender = (s) => {
  const cx = s / 2;
  const headR = m(s, 1.7, 2.1, 2.5);
  const headY = m(s, 4.4, 5.2, 6);
  return (
    <>
      <circle key="head" cx={cx} cy={headY} r={headR} fill="none" />
      {path(
        `M${cx - m(s, 3.6, 4.4, 5.2)} ${s - m(s, 2.8, 3.2, 3.6)} C${cx - m(s, 3.4, 4.2, 5)} ${s * 0.52}, ${cx + m(s, 3.4, 4.2, 5)} ${s * 0.52}, ${cx + m(s, 3.6, 4.4, 5.2)} ${s - m(s, 2.8, 3.2, 3.6)}`,
        "torso",
      )}
      {path(`M${cx - headR * 1.35} ${headY - 0.2} H${cx + headR * 1.35}`, "brim")}
    </>
  );
};

const clock: GlyphRender = (s) => {
  const r = m(s, 5.4, 6.8, 8.2);
  const cx = s / 2;
  const cy = s / 2;
  return (
    <>
      <circle key="rim" cx={cx} cy={cy} r={r} fill="none" />
      {path(`M${cx} ${cy} L${cx} ${cy - r * 0.55}`, "h")}
      {path(`M${cx} ${cy} L${cx + r * 0.42} ${cy + r * 0.18}`, "m")}
      {dot(cx, cy, m(s, 0.75, 0.9, 1.05), "hub")}
    </>
  );
};

const warning: GlyphRender = (s) => {
  const top = m(s, 2.6, 3, 3.4);
  const bot = s - m(s, 2.4, 2.8, 3.2);
  return (
    <>
      {path(`M${s / 2} ${top} L${s - m(s, 2.6, 3.2, 3.8)} ${bot} H${m(s, 2.6, 3.2, 3.8)} Z`, "tri")}
      {path(`M${s / 2} ${s * 0.38} V${s * 0.58}`, "bang")}
      {dot(s / 2, s * 0.7, m(s, 0.75, 0.9, 1.05), "dot")}
    </>
  );
};

const trash: GlyphRender = (s) => {
  const p = m(s, 3.4, 4.2, 5);
  return (
    <>
      {path(`M${p} ${p + m(s, 2.6, 3.2, 3.8)} H${s - p} L${s - p - m(s, 1.2, 1.4, 1.6)} ${s - p} H${p + m(s, 1.2, 1.4, 1.6)} Z`, "can")}
      {path(`M${p - 0.6} ${p + m(s, 2.6, 3.2, 3.8)} H${s - p + 0.6}`, "rim")}
      {path(`M${s * 0.38} ${p} H${s * 0.62} V${p + m(s, 2.6, 3.2, 3.8)}`, "lid")}
    </>
  );
};

const pencil: GlyphRender = (s) => {
  const p = m(s, 3.4, 4.2, 5);
  return (
    <>
      {path(`M${p + m(s, 2.2, 2.6, 3)} ${s - p} L${p} ${s - p} L${p} ${s - p - m(s, 2.2, 2.6, 3)} L${s - p - m(s, 1.2, 1.4, 1.6)} ${p + m(s, 1.2, 1.4, 1.6)} L${s - p} ${p + m(s, 3.4, 4.2, 5)} Z`, "body")}
      {path(`M${s - p - m(s, 3.6, 4.4, 5.2)} ${p} L${s - p} ${p} L${s - p} ${p + m(s, 3.6, 4.4, 5.2)}`, "tip")}
      {dot(s - p, p, m(s, 0.7, 0.8, 0.9), "lead")}
    </>
  );
};

const share: GlyphRender = (s) => {
  const r = m(s, 1.35, 1.6, 1.85);
  const a = { x: s - m(s, 4, 4.8, 5.6), y: m(s, 4, 4.8, 5.6) };
  const b = { x: m(s, 4, 4.8, 5.6), y: s / 2 };
  const c = { x: s - m(s, 4, 4.8, 5.6), y: s - m(s, 4, 4.8, 5.6) };
  return (
    <>
      <circle key="a" cx={a.x} cy={a.y} r={r} fill="none" />
      <circle key="b" cx={b.x} cy={b.y} r={r} fill="none" />
      <circle key="c" cx={c.x} cy={c.y} r={r} fill="none" />
      {path(`M${b.x + r * 0.6} ${b.y - r * 0.4} L${a.x - r * 0.6} ${a.y + r * 0.4}`, "ab")}
      {path(`M${b.x + r * 0.6} ${b.y + r * 0.4} L${c.x - r * 0.6} ${c.y - r * 0.4}`, "bc")}
    </>
  );
};

const eye: GlyphRender = (s) => {
  const open = m(s, 2.8, 3.4, 4);
  return (
    <>
      {path(`M${m(s, 2.2, 2.6, 3)} ${s / 2} C${s * 0.32} ${s / 2 - open}, ${s * 0.68} ${s / 2 - open}, ${s - m(s, 2.2, 2.6, 3)} ${s / 2} C${s * 0.68} ${s / 2 + open}, ${s * 0.32} ${s / 2 + open}, ${m(s, 2.2, 2.6, 3)} ${s / 2}`, "lid")}
      <circle key="iris" cx={s / 2} cy={s / 2} r={m(s, 1.8, 2.2, 2.6)} fill="none" />
      {dot(s / 2, s / 2, m(s, 0.7, 0.85, 1), "pupil")}
    </>
  );
};

const eyeOff: GlyphRender = (s) => (
  <>
    {eye(s, false)}
    {path(`M${m(s, 3.2, 3.8, 4.4)} ${s - m(s, 3.2, 3.8, 4.4)} L${s - m(s, 3.2, 3.8, 4.4)} ${m(s, 3.2, 3.8, 4.4)}`, "slash")}
  </>
);

const filter: GlyphRender = (s) => {
  const p = m(s, 3.2, 4, 4.8);
  return path(
    `M${p} ${p} H${s - p} L${s * 0.62} ${s * 0.52} V${s - p} L${s * 0.38} ${s * 0.72} V${s * 0.52} Z`,
    "funnel",
  );
};

const grid: GlyphRender = (s) => {
  const p = m(s, 3, 3.6, 4.2);
  const g = (s - p * 2) / 2;
  const cells: ReactNode[] = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      cells.push(
        path(
          `M${p + c * g + 0.4} ${p + r * g + 0.4} H${p + (c + 1) * g - 0.4} V${p + (r + 1) * g - 0.4} H${p + c * g + 0.4} Z`,
          `${r}${c}`,
        ),
      );
    }
  }
  return <>{cells}</>;
};

const list: GlyphRender = (s) => {
  const x = m(s, 6.4, 7.8, 9.2);
  const x1 = s - m(s, 3.2, 3.8, 4.4);
  const ys = s === 16 ? [4.6, 8, 11.4] : s === 20 ? [5.4, 10, 14.6] : [6.2, 12, 17.8];
  return (
    <>
      {ys.map((y, i) => (
        <g key={i}>
          {dot(m(s, 3.4, 4.2, 5), y, m(s, 0.85, 1, 1.15), `d${i}`)}
          {path(`M${x} ${y} H${x1}`, `l${i}`)}
        </g>
      ))}
    </>
  );
};

const cloud: GlyphRender = (s) => {
  const y = s * 0.58;
  return (
    <>
      {path(
        `M${m(s, 3.2, 3.8, 4.4)} ${y} C${m(s, 3.2, 3.8, 4.4)} ${y - m(s, 2.6, 3.2, 3.8)}, ${s * 0.32} ${y - m(s, 3.6, 4.4, 5.2)}, ${s * 0.42} ${y - m(s, 2.4, 3, 3.6)} C${s * 0.48} ${m(s, 3.6, 4.2, 4.8)}, ${s * 0.7} ${m(s, 3.8, 4.4, 5)}, ${s * 0.72} ${y - m(s, 2.2, 2.6, 3)} C${s - m(s, 3.4, 4, 4.6)} ${y - m(s, 2.2, 2.6, 3)}, ${s - m(s, 2.8, 3.4, 4)} ${y}, ${s - m(s, 3.4, 4, 4.6)} ${y} Z`,
        "cloud",
      )}
    </>
  );
};

const wind: GlyphRender = (s) => {
  const y1 = s * 0.36;
  const y2 = s * 0.52;
  const y3 = s * 0.68;
  const x0 = m(s, 2.8, 3.4, 4);
  return (
    <>
      {path(`M${x0} ${y1} H${s - m(s, 4.4, 5.4, 6.4)}`, "a")}
      {path(`M${x0} ${y2} H${s - m(s, 3.2, 3.8, 4.4)}`, "b")}
      {path(`M${x0} ${y3} H${s - m(s, 5.6, 6.8, 8)}`, "c")}
      {dot(s - m(s, 3.4, 4.2, 5), y1, m(s, 0.7, 0.8, 0.9), "tip")}
    </>
  );
};

const phone: GlyphRender = (s) => {
  const p = m(s, 5.2, 6.4, 7.6);
  return path(
    `M${p} ${s * 0.38} C${p} ${s * 0.28}, ${s * 0.38} ${m(s, 3.2, 3.8, 4.4)}, ${s * 0.48} ${m(s, 3.6, 4.2, 4.8)} C${s * 0.54} ${s * 0.42}, ${s * 0.5} ${s * 0.5}, ${s * 0.58} ${s * 0.58} C${s - m(s, 3.6, 4.2, 4.8)} ${s * 0.62}, ${s - p} ${s * 0.72}, ${s - p} ${s * 0.82} C${s - p} ${s - m(s, 3.4, 4, 4.6)}, ${s * 0.62} ${s - m(s, 3.2, 3.8, 4.4)}, ${s * 0.52} ${s - m(s, 3.6, 4.2, 4.8)} C${s * 0.32} ${s * 0.7}, ${p} ${s * 0.58}, ${p} ${s * 0.38}Z`,
    "handset",
  );
};

const mail: GlyphRender = message;

const flag: GlyphRender = (s) => {
  const x = m(s, 4.2, 5, 5.8);
  return (
    <>
      {path(`M${x} ${m(s, 2.8, 3.4, 4)} V${s - m(s, 2.6, 3, 3.4)}`, "pole")}
      {path(
        `M${x} ${m(s, 2.8, 3.4, 4)} H${s - m(s, 3.2, 3.8, 4.4)} L${s - m(s, 5.2, 6.2, 7.2)} ${s * 0.38} L${s - m(s, 3.2, 3.8, 4.4)} ${s * 0.52} H${x}`,
        "fly",
      )}
    </>
  );
};

const creel: GlyphRender = (s) => {
  const p = m(s, 3.4, 4.2, 5);
  return (
    <>
      {path(`M${p} ${s * 0.42} H${s - p} L${s - p - m(s, 1.2, 1.4, 1.6)} ${s - p} H${p + m(s, 1.2, 1.4, 1.6)} Z`, "basket")}
      {path(`M${p + m(s, 1.6, 2, 2.4)} ${s * 0.42} C${p + m(s, 1.6, 2, 2.4)} ${p}, ${s - p - m(s, 1.6, 2, 2.4)} ${p}, ${s - p - m(s, 1.6, 2, 2.4)} ${s * 0.42}`, "handle")}
      {s >= 20 ? path(`M${s * 0.38} ${s * 0.58} H${s * 0.62}`, "slot") : null}
      {dot(s / 2, s * 0.7, m(s, 0.7, 0.85, 1), "rivet")}
    </>
  );
};

const box: GlyphRender = (s) => {
  const p = m(s, 3.2, 3.8, 4.4);
  return (
    <>
      {path(`M${p} ${s * 0.4} H${s - p} V${s - p} H${p} Z`, "body")}
      {path(`M${p} ${s * 0.4} L${s / 2} ${m(s, 2.8, 3.2, 3.6)} L${s - p} ${s * 0.4}`, "lid")}
      {path(`M${s / 2} ${m(s, 2.8, 3.2, 3.6)} V${s * 0.4}`, "ridge")}
    </>
  );
};

const leaf: GlyphRender = (s) => {
  const p = m(s, 3.2, 3.8, 4.4);
  return (
    <>
      {path(
        `M${p} ${s - p} C${p} ${s * 0.4}, ${s * 0.42} ${p}, ${s - p} ${p} C${s - p} ${s * 0.6}, ${s * 0.58} ${s - p}, ${p} ${s - p}`,
        "blade",
      )}
      {path(`M${p + m(s, 1.6, 2, 2.4)} ${s - p - m(s, 1.6, 2, 2.4)} L${s * 0.62} ${s * 0.38}`, "vein")}
    </>
  );
};

const home: GlyphRender = (s) => {
  const p = m(s, 3.2, 3.8, 4.4);
  return (
    <>
      {path(`M${s / 2} ${p} L${s - p} ${s * 0.46} V${s - p} H${p} V${s * 0.46} Z`, "house")}
      {path(`M${s * 0.42} ${s - p} V${s * 0.58} H${s * 0.58} V${s - p}`, "door")}
    </>
  );
};

const sunrise: GlyphRender = (s) => {
  const cy = s * 0.58;
  const r = m(s, 3.6, 4.6, 5.6);
  return (
    <>
      {path(`M${m(s, 2.6, 3.2, 3.8)} ${cy} H${s - m(s, 2.6, 3.2, 3.8)}`, "horizon")}
      {path(
        `M${s / 2 - r} ${cy} A${r} ${r} 0 0 1 ${s / 2 + r} ${cy}`,
        "sun",
      )}
      {s >= 20
        ? path(`M${s / 2} ${cy - r - m(s, 0, 1.6, 2)} V${cy - r - m(s, 0, 3.2, 4)}`, "ray")
        : null}
      {dot(s / 2, cy - r * 0.35, m(s, 0.7, 0.85, 1), "hub")}
    </>
  );
};

const images: GlyphRender = (s) => {
  const p = m(s, 2.8, 3.4, 4);
  return (
    <>
      {path(`M${p + m(s, 1.8, 2.2, 2.6)} ${p} H${s - p} V${s - p - m(s, 1.8, 2.2, 2.6)} H${p + m(s, 1.8, 2.2, 2.6)} Z`, "back")}
      {path(`M${p} ${p + m(s, 1.8, 2.2, 2.6)} H${s - p - m(s, 1.8, 2.2, 2.6)} V${s - p} H${p} Z`, "front")}
      {path(
        `M${p} ${s * 0.7} L${s * 0.36} ${s * 0.5} L${s * 0.52} ${s * 0.64} L${s * 0.64} ${s * 0.52} L${s - p - m(s, 1.8, 2.2, 2.6)} ${s * 0.72}`,
        "ridge",
      )}
    </>
  );
};

const help: GlyphRender = (s) => {
  const r = m(s, 5.6, 7, 8.4);
  return (
    <>
      <circle key="rim" cx={s / 2} cy={s / 2} r={r} fill="none" />
      {path(
        `M${s * 0.38} ${s * 0.4} C${s * 0.38} ${s * 0.3}, ${s * 0.62} ${s * 0.3}, ${s * 0.62} ${s * 0.42} C${s * 0.62} ${s * 0.54}, ${s / 2} ${s * 0.52}, ${s / 2} ${s * 0.62}`,
        "q",
      )}
      {dot(s / 2, s * 0.74, m(s, 0.75, 0.9, 1.05), "dot")}
    </>
  );
};

const info: GlyphRender = (s) => {
  const r = m(s, 5.6, 7, 8.4);
  return (
    <>
      <circle key="rim" cx={s / 2} cy={s / 2} r={r} fill="none" />
      {path(`M${s / 2} ${s * 0.46} V${s * 0.7}`, "stem")}
      {dot(s / 2, s * 0.36, m(s, 0.75, 0.9, 1.05), "dot")}
    </>
  );
};

const pkg: GlyphRender = box;

const printer: GlyphRender = (s) => {
  const p = m(s, 3.2, 3.8, 4.4);
  return (
    <>
      {path(`M${p} ${s * 0.42} H${s - p} V${s * 0.72} H${p} Z`, "body")}
      {path(`M${p + m(s, 1.6, 2, 2.4)} ${s * 0.42} V${p} H${s - p - m(s, 1.6, 2, 2.4)} V${s * 0.42}`, "tray")}
      {path(`M${p + m(s, 1.6, 2, 2.4)} ${s * 0.72} V${s - p} H${s - p - m(s, 1.6, 2, 2.4)} V${s * 0.72}`, "out")}
      {dot(s - p - m(s, 2.2, 2.6, 3), s * 0.56, m(s, 0.7, 0.8, 0.9), "led")}
    </>
  );
};

const copy: GlyphRender = (s) => {
  const p = m(s, 3, 3.6, 4.2);
  const o = m(s, 2, 2.4, 2.8);
  return (
    <>
      {path(`M${p + o} ${p} H${s - p} V${s - p - o} H${p + o} Z`, "back")}
      {path(`M${p} ${p + o} H${s - p - o} V${s - p} H${p} Z`, "front")}
    </>
  );
};

const crop: GlyphRender = (s) => {
  const p = m(s, 4, 5, 6);
  return (
    <>
      {path(`M${p} ${m(s, 2.6, 3.2, 3.8)} V${s - p} H${s - m(s, 2.6, 3.2, 3.8)}`, "a")}
      {path(`M${s - p} ${s - m(s, 2.6, 3.2, 3.8)} V${p} H${m(s, 2.6, 3.2, 3.8)}`, "b")}
    </>
  );
};

const branch: GlyphRender = (s) => {
  const x = s * 0.36;
  return (
    <>
      {path(`M${x} ${m(s, 3.4, 4, 4.6)} V${s - m(s, 3.4, 4, 4.6)}`, "trunk")}
      {path(`M${x} ${s * 0.42} C${x} ${s * 0.3}, ${s * 0.7} ${s * 0.3}, ${s * 0.7} ${s * 0.42}`, "arm")}
      {dot(x, m(s, 3.4, 4, 4.6), m(s, 1.1, 1.3, 1.5), "a")}
      {dot(x, s - m(s, 3.4, 4, 4.6), m(s, 1.1, 1.3, 1.5), "b")}
      {dot(s * 0.7, s * 0.42, m(s, 1.1, 1.3, 1.5), "c")}
    </>
  );
};

const undo: GlyphRender = (s) => {
  const r = m(s, 4.6, 5.8, 7);
  const cx = s / 2 + m(s, 0.4, 0.5, 0.6);
  const cy = s / 2 + m(s, 0.6, 0.8, 1);
  return (
    <>
      {path(`M${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx} ${cy - r}`, "arc")}
      {path(
        `M${cx - r - m(s, 0.2, 0.3, 0.4)} ${cy - m(s, 3.2, 4, 4.8)} L${cx - r} ${cy} L${cx - r + m(s, 3.6, 4.4, 5.2)} ${cy - m(s, 0.4, 0.5, 0.6)}`,
        "head",
      )}
    </>
  );
};

const more: GlyphRender = (s) => {
  const y = s / 2;
  const r = m(s, 0.95, 1.15, 1.35);
  const span = m(s, 4.2, 5.2, 6.2);
  return (
    <>
      {dot(s / 2 - span, y, r, "a")}
      {dot(s / 2, y, r, "b")}
      {dot(s / 2 + span, y, r, "c")}
    </>
  );
};

const moreVertical: GlyphRender = (s) => {
  const x = s / 2;
  const r = m(s, 0.95, 1.15, 1.35);
  const span = m(s, 4.2, 5.2, 6.2);
  return (
    <>
      {dot(x, s / 2 - span, r, "a")}
      {dot(x, s / 2, r, "b")}
      {dot(x, s / 2 + span, r, "c")}
    </>
  );
};

const grip: GlyphRender = (s) => {
  const xs = [s / 2 - m(s, 1.8, 2.2, 2.6), s / 2 + m(s, 1.8, 2.2, 2.6)];
  const ys = s === 16 ? [4.4, 8, 11.6] : s === 20 ? [5.2, 10, 14.8] : [6, 12, 18];
  return (
    <>
      {xs.flatMap((x, i) => ys.map((y, j) => dot(x, y, m(s, 0.75, 0.9, 1.05), `${i}${j}`)))}
    </>
  );
};

const table: GlyphRender = (s) => {
  const p = m(s, 3, 3.6, 4.2);
  return (
    <>
      {path(`M${p} ${p} H${s - p} V${s - p} H${p} Z`, "frame")}
      {path(`M${p} ${p + m(s, 3.4, 4.2, 5)} H${s - p}`, "head")}
      {path(`M${s / 2} ${p + m(s, 3.4, 4.2, 5)} V${s - p}`, "col")}
    </>
  );
};

const library: GlyphRender = (s) => {
  const p = m(s, 3, 3.6, 4.2);
  const w = m(s, 3.2, 4, 4.8);
  return (
    <>
      {path(`M${p} ${p} H${p + w} V${s - p} H${p} Z`, "a")}
      {path(`M${s / 2 - w / 2} ${p + m(s, 1.2, 1.4, 1.6)} H${s / 2 + w / 2} V${s - p} H${s / 2 - w / 2} Z`, "b")}
      {path(`M${s - p - w} ${p} H${s - p} V${s - p} H${s - p - w} Z`, "c")}
    </>
  );
};

const play: GlyphRender = (s) => {
  const p = m(s, 5, 6, 7);
  return path(`M${p} ${m(s, 3.6, 4.4, 5.2)} V${s - m(s, 3.6, 4.4, 5.2)} L${s - p} ${s / 2} Z`, "play");
};

const key: GlyphRender = (s) => {
  const cx = s * 0.34;
  const cy = s * 0.38;
  const r = m(s, 2.6, 3.2, 3.8);
  return (
    <>
      <circle key="bow" cx={cx} cy={cy} r={r} fill="none" />
      {path(`M${cx + r * 0.7} ${cy + r * 0.7} L${s - m(s, 3.2, 3.8, 4.4)} ${s - m(s, 3.6, 4.2, 4.8)}`, "shaft")}
      {path(`M${s * 0.68} ${s * 0.62} H${s * 0.8}`, "bit")}
    </>
  );
};

const link: GlyphRender = (s) => {
  const r = m(s, 2.4, 3, 3.6);
  return (
    <>
      {path(
        `M${s * 0.42} ${s * 0.38} A${r} ${r} 0 1 1 ${s * 0.62} ${s * 0.22}`,
        "a",
      )}
      {path(
        `M${s * 0.38} ${s * 0.62} A${r} ${r} 0 1 0 ${s * 0.58} ${s * 0.78}`,
        "b",
      )}
      {path(`M${s * 0.4} ${s * 0.6} L${s * 0.6} ${s * 0.4}`, "join")}
    </>
  );
};

const settings: GlyphRender = vise;

const logout: GlyphRender = (s) => {
  const p = m(s, 3.4, 4.2, 5);
  return (
    <>
      {path(`M${p} ${p} H${s * 0.48} V${s - p} H${p} Z`, "door")}
      {path(`M${s * 0.48} ${s / 2} H${s - p}`, "shaft")}
      {path(
        `M${s - p - m(s, 3.2, 4, 4.8)} ${s / 2 - m(s, 3, 3.6, 4.2)} L${s - p} ${s / 2} L${s - p - m(s, 3.2, 4, 4.8)} ${s / 2 + m(s, 3, 3.6, 4.2)}`,
        "head",
      )}
    </>
  );
};

const login: GlyphRender = (s) => {
  const p = m(s, 3.4, 4.2, 5);
  return (
    <>
      {path(`M${s - p} ${p} H${s * 0.52} V${s - p} H${s - p} Z`, "door")}
      {path(`M${p} ${s / 2} H${s * 0.52}`, "shaft")}
      {path(
        `M${s * 0.52 - m(s, 3.2, 4, 4.8)} ${s / 2 - m(s, 3, 3.6, 4.2)} L${s * 0.52} ${s / 2} L${s * 0.52 - m(s, 3.2, 4, 4.8)} ${s / 2 + m(s, 3, 3.6, 4.2)}`,
        "head",
      )}
    </>
  );
};

const shield: GlyphRender = (s) => {
  const p = m(s, 3.4, 4.2, 5);
  return path(
    `M${s / 2} ${p} L${s - p} ${s * 0.32} V${s * 0.58} C${s - p} ${s - p}, ${s / 2} ${s - m(s, 2.4, 2.8, 3.2)}, ${s / 2} ${s - m(s, 2.4, 2.8, 3.2)} C${s / 2} ${s - m(s, 2.4, 2.8, 3.2)}, ${p} ${s - p}, ${p} ${s * 0.58} V${s * 0.32} Z`,
    "shield",
  );
};

const ban: GlyphRender = (s) => {
  const r = m(s, 5.6, 7, 8.4);
  return (
    <>
      <circle key="rim" cx={s / 2} cy={s / 2} r={r} fill="none" />
      {path(`M${s / 2 - r * 0.7} ${s / 2 + r * 0.7} L${s / 2 + r * 0.7} ${s / 2 - r * 0.7}`, "slash")}
    </>
  );
};

const refresh: GlyphRender = (s) => {
  const r = m(s, 4.8, 6, 7.2);
  const cx = s / 2;
  const cy = s / 2;
  return (
    <>
      {path(`M${cx + r} ${cy - m(s, 1.2, 1.4, 1.6)} A${r} ${r} 0 1 0 ${cx + r * 0.2} ${cy - r}`, "arc")}
      {path(
        `M${cx + r - m(s, 3, 3.6, 4.2)} ${cy - r * 0.15} L${cx + r} ${cy - m(s, 1.2, 1.4, 1.6)} L${cx + r + m(s, 0.6, 0.8, 1)} ${cy - r * 0.55}`,
        "head",
      )}
    </>
  );
};

const repeat: GlyphRender = (s) => {
  const p = m(s, 3.4, 4.2, 5);
  return (
    <>
      {path(`M${p} ${s * 0.38} H${s - p} V${s * 0.52}`, "a")}
      {path(`M${s - p} ${s * 0.62} H${p} V${s * 0.48}`, "b")}
      {path(`M${s - p - m(s, 2.8, 3.4, 4)} ${s * 0.26} L${s - p} ${s * 0.38} L${s - p - m(s, 2.8, 3.4, 4)} ${s * 0.5}`, "ah")}
      {path(`M${p + m(s, 2.8, 3.4, 4)} ${s * 0.5} L${p} ${s * 0.62} L${p + m(s, 2.8, 3.4, 4)} ${s * 0.74}`, "bh")}
    </>
  );
};

const split: GlyphRender = (s) => {
  const mid = s / 2;
  return (
    <>
      {path(`M${m(s, 3, 3.6, 4.2)} ${mid} H${s - m(s, 3, 3.6, 4.2)}`, "bar")}
      {path(`M${mid} ${m(s, 3.4, 4.2, 5)} V${s - m(s, 3.4, 4.2, 5)}`, "cut")}
    </>
  );
};

const pin: GlyphRender = (s) => {
  const cx = s / 2;
  return (
    <>
      <circle key="head" cx={cx} cy={m(s, 5.2, 6.4, 7.6)} r={m(s, 2.4, 3, 3.6)} fill="none" />
      {path(`M${cx} ${m(s, 7.6, 9.4, 11.2)} V${s - m(s, 3, 3.4, 3.8)}`, "needle")}
      {dot(cx, m(s, 5.2, 6.4, 7.6), m(s, 0.7, 0.85, 1), "ink")}
    </>
  );
};

const store: GlyphRender = (s) => {
  const p = m(s, 3.2, 3.8, 4.4);
  return (
    <>
      {path(`M${p} ${s * 0.42} H${s - p} V${s - p} H${p} Z`, "shop")}
      {path(`M${p} ${s * 0.42} L${s / 2} ${p} L${s - p} ${s * 0.42}`, "awning")}
      {path(`M${s * 0.42} ${s - p} V${s * 0.58} H${s * 0.58} V${s - p}`, "door")}
    </>
  );
};

const building: GlyphRender = (s) => {
  const p = m(s, 3.4, 4.2, 5);
  return (
    <>
      {path(`M${p} ${p} H${s - p} V${s - p} H${p} Z`, "body")}
      {path(`M${s * 0.38} ${s * 0.36} H${s * 0.46} V${s * 0.48} H${s * 0.38} Z`, "w1")}
      {path(`M${s * 0.54} ${s * 0.36} H${s * 0.62} V${s * 0.48} H${s * 0.54} Z`, "w2")}
      {path(`M${s * 0.42} ${s - p} V${s * 0.62} H${s * 0.58} V${s - p}`, "door")}
    </>
  );
};

const compass: GlyphRender = (s) => {
  const r = m(s, 5.4, 6.8, 8.2);
  const cx = s / 2;
  const cy = s / 2;
  return (
    <>
      <circle key="rim" cx={cx} cy={cy} r={r} fill="none" />
      {path(`M${cx} ${cy - r * 0.62} L${cx + r * 0.28} ${cy + r * 0.42} L${cx} ${cy + r * 0.12} L${cx - r * 0.28} ${cy + r * 0.42} Z`, "needle")}
      {dot(cx, cy, m(s, 0.75, 0.9, 1.05), "hub")}
    </>
  );
};

const layers: GlyphRender = (s) => {
  const mid = s / 2;
  const w = m(s, 5.6, 7, 8.4);
  return (
    <>
      {path(`M${mid} ${m(s, 3, 3.4, 3.8)} L${mid + w} ${s * 0.36} L${mid} ${s * 0.48} L${mid - w} ${s * 0.36} Z`, "a")}
      {path(`M${mid - w} ${s * 0.52} L${mid} ${s * 0.64} L${mid + w} ${s * 0.52}`, "b")}
      {s >= 20 ? path(`M${mid - w} ${s * 0.66} L${mid} ${s * 0.78} L${mid + w} ${s * 0.66}`, "c") : null}
    </>
  );
};

const flame: GlyphRender = (s) => {
  const p = m(s, 3.4, 4.2, 5);
  return (
    <>
      {path(
        `M${s / 2} ${p} C${s * 0.7} ${s * 0.4}, ${s - p} ${s * 0.55}, ${s / 2} ${s - p} C${p} ${s * 0.55}, ${s * 0.3} ${s * 0.4}, ${s / 2} ${p}`,
        "flame",
      )}
      {dot(s / 2, s * 0.62, m(s, 0.7, 0.85, 1), "ember")}
    </>
  );
};

const timer: GlyphRender = (s) => {
  const r = m(s, 5, 6.4, 7.6);
  const cx = s / 2;
  const cy = s / 2 + m(s, 0.6, 0.8, 1);
  return (
    <>
      <circle key="rim" cx={cx} cy={cy} r={r} fill="none" />
      {path(`M${cx - m(s, 2, 2.4, 2.8)} ${cy - r - m(s, 0.4, 0.5, 0.6)} H${cx + m(s, 2, 2.4, 2.8)}`, "top")}
      {path(`M${cx} ${cy} L${cx + r * 0.35} ${cy - r * 0.45}`, "hand")}
      {dot(cx, cy, m(s, 0.7, 0.85, 1), "hub")}
    </>
  );
};

const activity: GlyphRender = current;

const database: GlyphRender = (s) => {
  const p = m(s, 3.4, 4.2, 5);
  const r = m(s, 2.2, 2.6, 3);
  return (
    <>
      <ellipse key="top" cx={s / 2} cy={p + r} rx={s / 2 - p} ry={r} fill="none" />
      {path(`M${p} ${p + r} V${s - p - r} A${s / 2 - p} ${r} 0 0 0 ${s - p} ${s - p - r} V${p + r}`, "body")}
      {s >= 20 ? path(`M${p} ${s * 0.52} A${s / 2 - p} ${r} 0 0 0 ${s - p} ${s * 0.52}`, "ring") : null}
    </>
  );
};

const ticket: GlyphRender = (s) => {
  const p = m(s, 3.2, 3.8, 4.4);
  return (
    <>
      {path(
        `M${p} ${s * 0.36} H${s - p} V${s * 0.48} A${m(s, 1.4, 1.7, 2)} ${m(s, 1.4, 1.7, 2)} 0 0 0 ${s - p} ${s * 0.64} V${s * 0.64 + m(s, 0, 0, 0)} V${s - s * 0.36} H${p} V${s * 0.64} A${m(s, 1.4, 1.7, 2)} ${m(s, 1.4, 1.7, 2)} 0 0 1 ${p} ${s * 0.48} Z`,
        "stub",
      )}
      {path(`M${s * 0.42} ${s * 0.44} V${s * 0.56}`, "perf")}
    </>
  );
};

const typeMark: GlyphRender = (s) => {
  const p = m(s, 3.4, 4.2, 5);
  return (
    <>
      {path(`M${p} ${p} H${s - p}`, "bar")}
      {path(`M${s / 2} ${p} V${s - p}`, "stem")}
      {path(`M${s * 0.38} ${s - p} H${s * 0.62}`, "foot")}
    </>
  );
};

const at: GlyphRender = (s) => {
  const r = m(s, 5.2, 6.6, 8);
  return (
    <>
      <circle key="rim" cx={s / 2} cy={s / 2} r={r} fill="none" />
      <circle key="inner" cx={s / 2} cy={s / 2} r={m(s, 2, 2.5, 3)} fill="none" />
      {path(`M${s / 2 + m(s, 2, 2.5, 3)} ${s / 2} V${s / 2 + r * 0.55}`, "tail")}
    </>
  );
};

const thumbsUp: GlyphRender = (s) => {
  const p = m(s, 3.2, 3.8, 4.4);
  return (
    <>
      {path(`M${p} ${s * 0.48} H${s * 0.4} V${s - p} H${p} Z`, "palm")}
      {path(
        `M${s * 0.4} ${s * 0.48} L${s * 0.52} ${p} C${s * 0.62} ${p}, ${s * 0.66} ${s * 0.32}, ${s * 0.56} ${s * 0.42} L${s - p} ${s * 0.48} V${s * 0.72} H${s * 0.4}`,
        "thumb",
      )}
    </>
  );
};

const medal: GlyphRender = (s) => {
  const cy = s * 0.58;
  const r = m(s, 3.6, 4.6, 5.6);
  return (
    <>
      {path(`M${s * 0.36} ${m(s, 2.8, 3.2, 3.6)} L${s / 2} ${s * 0.36} L${s * 0.64} ${m(s, 2.8, 3.2, 3.6)}`, "ribbon")}
      <circle key="disc" cx={s / 2} cy={cy} r={r} fill="none" />
      {dot(s / 2, cy, m(s, 0.85, 1, 1.15), "hub")}
    </>
  );
};

const save: GlyphRender = (s) => {
  const p = m(s, 3.2, 3.8, 4.4);
  return (
    <>
      {path(`M${p} ${p} H${s - p - m(s, 2, 2.4, 2.8)} L${s - p} ${p + m(s, 2, 2.4, 2.8)} V${s - p} H${p} Z`, "disk")}
      {path(`M${s * 0.38} ${s - p} V${s * 0.52} H${s * 0.62} V${s - p}`, "label")}
      {path(`M${s * 0.4} ${p} H${s * 0.62} V${s * 0.36} H${s * 0.4} Z`, "tab")}
    </>
  );
};

const userPlus: GlyphRender = (s) => (
  <>
    {angler(s, false)}
    {path(`M${s - m(s, 4.4, 5.2, 6)} ${m(s, 4.2, 5, 5.8)} V${m(s, 8.2, 9.8, 11.4)}`, "v")}
    {path(`M${s - m(s, 6.4, 7.6, 8.8)} ${m(s, 6.2, 7.4, 8.6)} H${s - m(s, 2.4, 2.8, 3.2)}`, "h")}
  </>
);

const userMinus: GlyphRender = (s) => (
  <>
    {angler(s, false)}
    {path(`M${s - m(s, 6.4, 7.6, 8.8)} ${m(s, 6.2, 7.4, 8.6)} H${s - m(s, 2.4, 2.8, 3.2)}`, "h")}
  </>
);

const userCheck: GlyphRender = (s) => (
  <>
    {angler(s, false)}
    {path(
      `M${s - m(s, 6.6, 7.8, 9)} ${m(s, 6.4, 7.6, 8.8)} L${s - m(s, 5, 5.8, 6.6)} ${m(s, 8, 9.4, 10.8)} L${s - m(s, 2.4, 2.8, 3.2)} ${m(s, 4.6, 5.4, 6.2)}`,
      "tick",
    )}
  </>
);

const live: GlyphRender = (s) => {
  const r = m(s, 5.2, 6.6, 8);
  return (
    <>
      <circle key="rim" cx={s / 2} cy={s / 2} r={r} fill="none" />
      {dot(s / 2, s / 2, m(s, 1.6, 2, 2.4), "pip", true)}
    </>
  );
};

/* ── Social — same 1.5px ink, not filled brand blobs ───────────── */

const instagram: GlyphRender = (s) => {
  const p = m(s, 3.2, 3.8, 4.4);
  return (
    <>
      {path(`M${p} ${p + m(s, 1.4, 1.7, 2)} A${m(s, 1.4, 1.7, 2)} ${m(s, 1.4, 1.7, 2)} 0 0 1 ${p + m(s, 1.4, 1.7, 2)} ${p} H${s - p - m(s, 1.4, 1.7, 2)} A${m(s, 1.4, 1.7, 2)} ${m(s, 1.4, 1.7, 2)} 0 0 1 ${s - p} ${p + m(s, 1.4, 1.7, 2)} V${s - p - m(s, 1.4, 1.7, 2)} A${m(s, 1.4, 1.7, 2)} ${m(s, 1.4, 1.7, 2)} 0 0 1 ${s - p - m(s, 1.4, 1.7, 2)} ${s - p} H${p + m(s, 1.4, 1.7, 2)} A${m(s, 1.4, 1.7, 2)} ${m(s, 1.4, 1.7, 2)} 0 0 1 ${p} ${s - p - m(s, 1.4, 1.7, 2)} Z`, "frame")}
      <circle key="lens" cx={s / 2} cy={s / 2} r={m(s, 2.4, 3, 3.6)} fill="none" />
      {dot(s - p - m(s, 1.6, 2, 2.4), p + m(s, 1.6, 2, 2.4), m(s, 0.65, 0.75, 0.85), "flash")}
    </>
  );
};

const youtube: GlyphRender = (s) => {
  const p = m(s, 2.6, 3.2, 3.8);
  return (
    <>
      {path(
        `M${p} ${s * 0.36} A${m(s, 1.6, 2, 2.4)} ${m(s, 1.6, 2, 2.4)} 0 0 1 ${p + m(s, 1.6, 2, 2.4)} ${s * 0.28} H${s - p - m(s, 1.6, 2, 2.4)} A${m(s, 1.6, 2, 2.4)} ${m(s, 1.6, 2, 2.4)} 0 0 1 ${s - p} ${s * 0.36} V${s * 0.64} A${m(s, 1.6, 2, 2.4)} ${m(s, 1.6, 2, 2.4)} 0 0 1 ${s - p - m(s, 1.6, 2, 2.4)} ${s * 0.72} H${p + m(s, 1.6, 2, 2.4)} A${m(s, 1.6, 2, 2.4)} ${m(s, 1.6, 2, 2.4)} 0 0 1 ${p} ${s * 0.64} Z`,
        "screen",
      )}
      {path(`M${s * 0.42} ${s * 0.4} V${s * 0.6} L${s * 0.62} ${s / 2} Z`, "play")}
    </>
  );
};

const facebook: GlyphRender = (s) => {
  const x = s * 0.52;
  return (
    <>
      {path(`M${x} ${s - m(s, 2.8, 3.2, 3.6)} V${s * 0.42}`, "stem")}
      {path(`M${x} ${s * 0.42} C${x} ${m(s, 3.2, 3.8, 4.4)}, ${s * 0.68} ${m(s, 3.4, 4, 4.6)}, ${s - m(s, 3.6, 4.4, 5.2)} ${m(s, 4.8, 5.6, 6.4)}`, "bowl")}
      {path(`M${s * 0.36} ${s * 0.52} H${s * 0.66}`, "bar")}
    </>
  );
};

const socialX: GlyphRender = (s) => {
  const p = m(s, 4.2, 5.2, 6.2);
  return (
    <>
      {path(`M${p} ${p} L${s - p} ${s - p}`, "a")}
      {path(`M${s - p} ${p} L${p} ${s - p}`, "b")}
    </>
  );
};

const linkedin: GlyphRender = (s) => {
  const p = m(s, 3.2, 3.8, 4.4);
  return (
    <>
      {path(`M${p} ${p} H${s - p} V${s - p} H${p} Z`, "frame")}
      {dot(p + m(s, 2.4, 3, 3.6), p + m(s, 3.2, 3.8, 4.4), m(s, 0.85, 1, 1.15), "head")}
      {path(`M${p + m(s, 2.4, 3, 3.6)} ${p + m(s, 5.2, 6.2, 7.2)} V${s - p - m(s, 2.2, 2.6, 3)}`, "stem")}
      {path(
        `M${p + m(s, 2.4, 3, 3.6)} ${s * 0.52} C${p + m(s, 2.4, 3, 3.6)} ${s * 0.42}, ${s - p - m(s, 2.4, 3, 3.6)} ${s * 0.42}, ${s - p - m(s, 2.4, 3, 3.6)} ${s * 0.56} V${s - p - m(s, 2.2, 2.6, 3)}`,
        "n",
      )}
    </>
  );
};

export const GLYPHS: Record<IconName, GlyphRender> = {
  activity,
  angler,
  aperture,
  "arrow-left": arrowLeft,
  "arrow-right": arrowRight,
  "arrow-up-right": arrowUpRight,
  at,
  ban,
  bell,
  bookmark,
  box,
  branch,
  building,
  camera,
  check,
  "check-double": checkDouble,
  "chevron-down": chevron("down"),
  "chevron-left": chevron("left"),
  "chevron-right": chevron("right"),
  "chevron-up": chevron("up"),
  clock,
  close,
  cloud,
  compass,
  copy,
  creel,
  crop,
  current,
  database,
  download,
  external,
  eye,
  "eye-off": eyeOff,
  facebook,
  filter,
  flag,
  flame,
  gauge,
  grid,
  grip,
  hackle,
  hatch,
  heart,
  help,
  home,
  hook,
  images,
  info,
  instagram,
  key,
  layers,
  leaf,
  library,
  link,
  linkedin,
  list,
  live,
  loader,
  lock,
  login,
  logout,
  mail,
  map,
  medal,
  menu,
  message,
  minus,
  more,
  "more-vertical": moreVertical,
  notebook,
  package: pkg,
  pencil,
  phone,
  pin,
  play,
  plus,
  printer,
  refresh,
  repeat,
  rule,
  save,
  search,
  send,
  settings,
  share,
  shield,
  "social-x": socialX,
  sort,
  split,
  star,
  store,
  sunrise,
  swap,
  table,
  "thumbs-up": thumbsUp,
  ticket,
  timer,
  trash,
  type: typeMark,
  undo,
  upload,
  "user-check": userCheck,
  "user-minus": userMinus,
  "user-plus": userPlus,
  vise,
  warning,
  wind,
  youtube,
};
