// Neon synthwave for the Create your own page: a glowing grid floor that rushes toward you
// (faster while you scroll), twinkling stars, grid lines that light up around your finger or
// mouse, and a neon ripple plus a shooting star wherever you click or tap.
const PINK = "255, 79, 216", BLUE = "0, 229, 255", YELLOW = "255, 230, 0";
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rnd = (a, b) => a + (b - a) * Math.random();

const canvas = document.createElement("canvas");
canvas.className = "synth-canvas";
canvas.setAttribute("aria-hidden", "true");
document.body.prepend(canvas);
document.body.classList.add("synth-live");
const ctx = canvas.getContext("2d");

let w = 0, h = 0, dpr = 1, stars = [];
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth; h = window.innerHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars = Array.from({ length: Math.round(w * h / 9000) }, () => ({
    x: rnd(0, w), y: rnd(0, h * 0.55), r: rnd(0.5, 1.8), t: rnd(0, Math.PI * 2), s: rnd(0.6, 2),
  }));
}
resize();
window.addEventListener("resize", resize);

// The pointer lights up the grid around it; it fades out when the pointer leaves.
const pointer = { x: -999, y: -999, glow: 0 };
window.addEventListener("pointermove", (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.glow = 1; });
document.addEventListener("pointerleave", () => { pointer.glow = 0; });

// Click or tap: a neon ripple from that spot and a shooting star across the sky.
const ripples = [], comets = [];
window.addEventListener("pointerdown", (e) => {
  if (e.target.closest("input, textarea, select")) return;
  const colour = [PINK, BLUE, YELLOW][ripples.length % 3];
  ripples.push({ x: e.clientX, y: e.clientY, r: 0, life: 1, colour });
  comets.push({ x: rnd(0, w * 0.6), y: rnd(10, h * 0.3), vx: rnd(9, 14), vy: rnd(2, 4), life: 1 });
  boost = Math.min(boost + 4, 14);
});

// Scrolling speeds the floor up, like the home page spinner that turns faster as you go down.
let lastScroll = window.scrollY, boost = 0;
window.addEventListener("scroll", () => {
  boost = Math.min(boost + Math.abs(window.scrollY - lastScroll) * 0.08, 14);
  lastScroll = window.scrollY;
}, { passive: true });

let offset = 0, last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 16.7, 3); last = now;
  ctx.clearRect(0, 0, w, h);
  const horizon = h * 0.58;

  // Stars
  for (const s of stars) {
    s.t += 0.03 * s.s * dt;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.35 + 0.45 * Math.sin(s.t) ** 2})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  }

  // Horizon glow
  const glow = ctx.createLinearGradient(0, horizon - 60, 0, horizon + 10);
  glow.addColorStop(0, "rgba(255, 79, 216, 0)");
  glow.addColorStop(1, "rgba(255, 79, 216, .35)");
  ctx.fillStyle = glow; ctx.fillRect(0, horizon - 60, w, 70);

  // Floor: horizontal lines rush toward you, vertical lines fan out from the middle.
  const speed = (calm ? 0 : 0.6) + boost;
  boost *= 0.94;
  offset = (offset + speed * 0.004 * dt) % 1;
  ctx.lineWidth = 2;
  for (let i = 0; i < 18; i++) {
    const z = (i + offset) / 18;            // 0 at the horizon, 1 at the bottom
    const y = horizon + (h - horizon) * z * z;
    ctx.strokeStyle = `rgba(${PINK}, ${0.15 + 0.7 * z})`;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  const fan = 22;
  for (let i = -fan; i <= fan; i++) {
    const xb = w / 2 + i * (w / 9);
    ctx.strokeStyle = `rgba(${BLUE}, .45)`;
    ctx.beginPath(); ctx.moveTo(w / 2 + i * 6, horizon); ctx.lineTo(xb, h); ctx.stroke();
  }
  ctx.strokeStyle = `rgba(${PINK}, .95)`; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, horizon); ctx.lineTo(w, horizon); ctx.stroke();

  // Spotlight under the pointer
  if (pointer.glow > 0.01) {
    const g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 160);
    g.addColorStop(0, `rgba(${BLUE}, ${0.35 * pointer.glow})`);
    g.addColorStop(1, `rgba(${BLUE}, 0)`);
    ctx.fillStyle = g; ctx.fillRect(pointer.x - 160, pointer.y - 160, 320, 320);
    pointer.glow *= 0.985;
  }

  // Ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.r += 9 * dt; r.life -= 0.018 * dt;
    if (r.life <= 0) { ripples.splice(i, 1); continue; }
    ctx.lineWidth = 4;
    ctx.shadowColor = `rgb(${r.colour})`; ctx.shadowBlur = 18;
    ctx.strokeStyle = `rgba(${r.colour}, ${r.life})`;
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = `rgba(255, 255, 255, ${r.life * 0.6})`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r * 0.7, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Shooting stars
  for (let i = comets.length - 1; i >= 0; i--) {
    const c = comets[i];
    c.x += c.vx * dt; c.y += c.vy * dt; c.life -= 0.012 * dt;
    if (c.life <= 0 || c.x > w + 50) { comets.splice(i, 1); continue; }
    const tail = ctx.createLinearGradient(c.x, c.y, c.x - c.vx * 12, c.y - c.vy * 12);
    tail.addColorStop(0, `rgba(255, 255, 255, ${c.life})`);
    tail.addColorStop(1, `rgba(${YELLOW}, 0)`);
    ctx.strokeStyle = tail; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x - c.vx * 12, c.y - c.vy * 12); ctx.stroke();
  }

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
