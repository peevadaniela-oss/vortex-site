// One big ink smiley for the About me page: two dots and a mouth on white. Touch the eyes or
// the mouth with your mouse (or finger) and the smiley wiggles, then for a random 3 to 5 seconds your pointer
// becomes an ink pen and draws wherever it goes. Then the ink fades away over 20 seconds.
const INK = "12, 10, 20";
const INK_MIN = 3000, INK_MAX = 5000; // the pen lasts a random time in this range
const DRY_FOR = 20000; // how long the ink takes to fade away
const WIGGLE_FOR = 700;
const rnd = (a, b) => a + (b - a) * Math.random();

const canvas = document.createElement("canvas");
canvas.className = "smiley-canvas";
canvas.setAttribute("aria-hidden", "true");
document.body.prepend(canvas);
document.body.classList.add("smiley-live");
const ctx = canvas.getContext("2d");

let w = 0, h = 0, dpr = 1, face = null;
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth; h = window.innerHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  face = { x: w / 2, y: h * 0.55, r: Math.min(w, h) * 0.38 };
}
resize();
window.addEventListener("resize", resize);

// A rough ink blot, so the smiley and the pen strokes look hand painted.
function blot(c, x, y, size, alpha = 0.92) {
  c.fillStyle = `rgba(${INK}, ${alpha})`;
  c.beginPath();
  const n = 12;
  for (let i = 0; i <= n; i++) {
    const a = i / n * Math.PI * 2, rr = size * rnd(0.82, 1.12);
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    i ? c.lineTo(px, py) : c.moveTo(px, py);
  }
  c.closePath(); c.fill();
}

// The smiley itself is painted once per size into its own layer.
const face2 = document.createElement("canvas");
function paintFace() {
  face2.width = w * dpr; face2.height = h * dpr;
  const c = face2.getContext("2d");
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const { x, y, r } = face;
  for (const ex of [-0.38, 0.38]) {
    for (let i = 0; i < 6; i++) blot(c, x + ex * r + rnd(-3, 3), y - r * 0.3 + rnd(-3, 3), r * 0.11);
  }
  for (let t = 0.12; t <= 0.88; t += 0.006) {
    const a = t * Math.PI;
    const thick = r * 0.05 * (0.7 + Math.sin(a) * 0.6);
    blot(c, x + Math.cos(a) * r * 0.62, y + r * 0.02 + Math.sin(a) * r * 0.55, thick);
  }
}
paintFace();
window.addEventListener("resize", paintFace);

// Ink trail: while inking, every move paints a line of wet blots from the last point, thicker
// when the pointer moves slowly.
// Each touch of the smiley starts its own stroke on its own layer. A stroke fades away 20 seconds
// after its pen time ends, whatever happens next, so ink never stays; only the smiley does.
const strokes = [];
let last = null, wiggleAt = -1e9;
const current = () => {
  const s = strokes[strokes.length - 1];
  return s && performance.now() < s.penUntil ? s : null;
};
function newStroke(now) {
  const layer = document.createElement("canvas");
  layer.width = w * dpr; layer.height = h * dpr;
  const c = layer.getContext("2d");
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  strokes.push({ layer, c, penUntil: now + rnd(INK_MIN, INK_MAX) });
  if (strokes.length > 8) strokes.shift();
}
// True when the pointer is on the painted eyes or mouth (with a few pixels of slack).
function onInk(x, y) {
  const px = Math.round(x * dpr), py = Math.round(y * dpr), pad = Math.round(4 * dpr);
  if (px < 0 || py < 0 || px >= face2.width || py >= face2.height) return false;
  const d = face2.getContext("2d").getImageData(Math.max(0, px - pad), Math.max(0, py - pad), pad * 2 + 1, pad * 2 + 1).data;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 40) return true;
  return false;
}
function onMove(x, y) {
  const now = performance.now();
  let stroke = current();
  if (!stroke) {
    last = null;
    if (!onInk(x, y)) return;
    newStroke(now);
    wiggleAt = now;
    stroke = current();
  }
  const p = last || { x, y };
  const dist = Math.hypot(x - p.x, y - p.y);
  const size = Math.max(7, 20 - dist * 0.15);
  const steps = Math.max(1, Math.ceil(dist / (size * 0.5)));
  for (let i = 1; i <= steps; i++) blot(stroke.c, p.x + (x - p.x) * i / steps, p.y + (y - p.y) * i / steps, size);
  last = { x, y };
}
window.addEventListener("pointermove", (e) => onMove(e.clientX, e.clientY));
window.addEventListener("pointerdown", (e) => { last = null; onMove(e.clientX, e.clientY); });

function frame(now) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // The smiley wiggles for a moment when its eyes or mouth are touched.
  const wt = (now - wiggleAt) / WIGGLE_FOR;
  if (wt < 1) {
    const cx = face.x * dpr, cy = face.y * dpr;
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(wt * Math.PI * 6) * 0.06 * (1 - wt));
    ctx.translate(-cx, -cy);
  }
  ctx.drawImage(face2, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // Draw each stroke, fading it out smoothly once its pen time is over, then drop it.
  for (let i = strokes.length - 1; i >= 0; i--) {
    const st = strokes[i];
    const t = Math.max(0, Math.min(1, (now - st.penUntil) / DRY_FOR));
    if (t >= 1) { strokes.splice(i, 1); continue; }
  }
  for (const st of strokes) {
    const t = Math.max(0, Math.min(1, (now - st.penUntil) / DRY_FOR));
    ctx.globalAlpha = 1 - t * t * (3 - 2 * t); // ease in and out
    ctx.drawImage(st.layer, 0, 0);
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
