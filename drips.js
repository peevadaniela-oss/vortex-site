// Wet paint: on page load, paint runs down from the background splatters, then dries.
// The splatter centres match splatter.svg (1600x1000, drawn with background-size: cover).
const SPLATS = [
  [140, 150, 70, "#00b3ff"], [1420, 120, 85, "#aeb1bd"], [1180, 620, 95, "#2a6bff"],
  [330, 800, 75, "#e8e9f0"], [820, 940, 60, "#2a6bff"], [1500, 830, 55, "#d9dbe3"],
  [700, 260, 40, "#c0c2cc"], [980, 380, 30, "#1f8bff"], [60, 520, 45, "#00b3ff"],
  [1300, 330, 35, "#d9dbe3"], [520, 560, 28, "#00e5ff"],
];
const SVG = "http://www.w3.org/2000/svg";
const rnd = (a, b) => a + (b - a) * Math.random();

// One run of paint: a wide neck where it leaves the splash, a thinner wobbly body, and a heavy
// bead at the tip. Coordinates are pixels inside a box `w` wide and `len` tall.
function dripPath(w, len) {
  const c = w / 2;
  const body = w * rnd(0.32, 0.48);          // body width
  const bead = Math.min(w * 0.5, body * 0.95); // bead radius
  const tip = len - bead;                      // centre of the bead
  const wob = () => rnd(-0.12, 0.12) * w;
  const l = c - body / 2, r = c + body / 2;
  const w1 = wob(), w2 = wob();
  return [
    `M0,0`,
    `C${c * 0.15},${len * 0.06} ${l},${len * 0.08} ${l + w1},${len * 0.3}`,
    `S${l + w2},${tip - bead * 1.4} ${c - bead * 0.75},${tip - bead * 0.5}`,
    `A${bead},${bead} 0 1 0 ${c + bead * 0.75},${tip - bead * 0.5}`,
    `C${r + w2},${tip - bead * 1.4} ${r + w1},${len * 0.45} ${r + w1 * 0.5},${len * 0.3}`,
    `C${r},${len * 0.08} ${w - c * 0.15},${len * 0.06} ${w},0`,
    `Z`,
  ].join(" ");
}

function paintDrips() {
  if (!document.body.classList.contains("sun")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  const scale = Math.max(vw / 1600, vh / 1000);
  const offX = (vw - 1600 * scale) / 2, offY = (vh - 1000 * scale) / 2;
  const layer = document.createElement("div");
  layer.className = "paint-drips";
  layer.setAttribute("aria-hidden", "true");
  let lastDrip = 0;
  for (const [x, y, r, color] of SPLATS) {
    const cx = offX + x * scale, cy = offY + y * scale, rs = r * scale;
    const count = rs > 40 ? 3 : rs > 22 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const w = Math.max(7, rs * rnd(0.14, 0.26));
      const len = rs * rnd(1.0, 2.6);
      const flow = rnd(3, 6.5);
      const delay = rnd(0, 1.5);
      lastDrip = Math.max(lastDrip, flow + delay);
      const drip = document.createElement("div");
      drip.className = "drip";
      drip.style.cssText = `left:${cx + rnd(-0.55, 0.55) * rs - w / 2}px;top:${cy + rs * 0.3}px;width:${w}px;height:${len}px;` +
        `--flow:${flow}s;--delay:${delay}s`;
      const svg = document.createElementNS(SVG, "svg");
      svg.setAttribute("width", w);
      svg.setAttribute("height", len);
      svg.setAttribute("viewBox", `0 0 ${w} ${len}`);
      const paint = document.createElementNS(SVG, "path");
      paint.setAttribute("d", dripPath(w, len));
      paint.setAttribute("fill", color);
      // a soft wet shine down one side of the run
      const shine = document.createElementNS(SVG, "ellipse");
      shine.setAttribute("cx", w * 0.42);
      shine.setAttribute("cy", len * 0.55);
      shine.setAttribute("rx", w * 0.06);
      shine.setAttribute("ry", len * 0.28);
      shine.setAttribute("fill", "rgba(255,255,255,.35)");
      shine.setAttribute("class", "shine");
      svg.append(paint, shine);
      drip.appendChild(svg);
      // now and then a drop breaks off the bead and falls
      if (Math.random() < 0.4) {
        const drop = document.createElement("span");
        drop.className = "drop";
        drop.style.cssText = `left:${cx + rnd(-0.3, 0.3) * rs}px;top:${cy + rs * 0.3 + len}px;--size:${w * 0.45}px;--c:${color};` +
          `--fall:${vh}px;--fall-delay:${flow + delay}s`;
        layer.appendChild(drop);
      }
      layer.appendChild(drip);
    }
  }
  // the splashes live on this layer too, so splashes and drips dry to the same colour together
  layer.style.setProperty("--dry-at", `${lastDrip * 0.8}s`);
  document.body.classList.add("wet");
  document.body.prepend(layer);
}
paintDrips();
