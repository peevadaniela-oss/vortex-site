// Bubbles for the Design your own page: yarn threads are piled over the black background and
// lots of bubbles float up. Every 2 minutes one bubble pops (or whenever someone clicks one):
// the background flashes neon blue and the black rolls back in as a wave.
const BUBBLES = 45;
const POP_EVERY = 2 * 60 * 1000;
const FLASH_FOR = 3000;
const COLOURS = ["#ff1f8e", "#ffe600", "#ff4fd8", "#2438d6", "#00b3ff"]; // hot pink, hot yellow, neon pink, dark blue, neon blue
const THREADS = 40;
const rnd = (a, b) => a + (b - a) * Math.random();
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Yarn: threads in every direction (diagonals too), piled on top of each other. Each one starts
// and ends off the screen, so no thread ends are visible. Each thread has a shadow, a twisted-ply texture and a shine.
const shade = (hex, k) => "#" + hex.slice(1).match(/../g)
  .map(h => Math.round(Math.min(255, parseInt(h, 16) * k)).toString(16).padStart(2, "0")).join("");

function paintLines() {
  const w = 1600, h = 1000;
  let threads = "";
  for (let i = 0; i < THREADS; i++) {
    const a = rnd(0, Math.PI), len = 5000;
    const mx = rnd(0, w), my = rnd(0, h);
    const dx = Math.cos(a) * len / 2, dy = Math.sin(a) * len / 2;
    const nx = -Math.sin(a), ny = Math.cos(a);
    const b1 = rnd(-300, 300), b2 = rnd(-300, 300);
    const d = `M${(mx - dx).toFixed(0)} ${(my - dy).toFixed(0)} ` +
      `C${(mx - dx / 3 + nx * b1).toFixed(0)} ${(my - dy / 3 + ny * b1).toFixed(0)} ` +
      `${(mx + dx / 3 + nx * b2).toFixed(0)} ${(my + dy / 3 + ny * b2).toFixed(0)} ` +
      `${(mx + dx).toFixed(0)} ${(my + dy).toFixed(0)}`;
    const c = COLOURS[i % COLOURS.length], t = rnd(14, 22);
    threads +=
      `<path d="${d}" stroke="#000" stroke-opacity=".55" stroke-width="${(t + 5).toFixed(1)}"/>` +
      `<path d="${d}" stroke="${shade(c, 0.7)}" stroke-width="${t.toFixed(1)}"/>` +
      `<path d="${d}" stroke="${c}" stroke-width="${(t * 0.8).toFixed(1)}" stroke-dasharray="${(t * 0.55).toFixed(1)} ${(t * 0.3).toFixed(1)}" stroke-linecap="butt"/>` +
      `<path d="${d}" stroke="#fff" stroke-opacity=".35" stroke-width="${(t * 0.18).toFixed(1)}" stroke-dasharray="${(t * 0.5).toFixed(1)} ${(t * 0.35).toFixed(1)}"/>`;
  }
  const lines = document.createElement("div");
  lines.className = "paint-lines";
  lines.setAttribute("aria-hidden", "true");
  lines.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round">${threads}</g></svg>`;
  document.body.prepend(lines);
}
paintLines();

const layer = document.createElement("div");
layer.className = "bubble-layer";
layer.setAttribute("aria-hidden", "true");
document.body.querySelector(".paint-lines").after(layer);

function blowBubbles() {
  layer.replaceChildren();
  for (let i = 0; i < BUBBLES; i++) {
    layer.append(newBubble());
  }
}

function newBubble() {
  const b = document.createElement("span");
  const size = rnd(18, 110);
  b.className = "bubble";
  b.style.cssText = `width:${size}px;height:${size}px;left:${rnd(-2, 98)}%;` +
    `--dur:${rnd(10, 24)}s;--delay:${-rnd(0, 24)}s;--sway:${rnd(-40, 40)}px`;
  return b;
}

function popBubble(b) {
  b.style.transform = getComputedStyle(b).transform; // freeze it where it is, then burst
  b.classList.add("pop");
  setTimeout(() => b.replaceWith(newBubble()), 400);

  blueWave();
}

// The background turns neon blue, then the black rolls back in as a wave that washes the blue away.
// Two wavy edges sweep across: a dark blue one first, then the black one.
const WAVE_EDGE = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M0 0 H88 Q100 8 88 17 T88 33 T88 50 T88 67 T88 83 T88 100 H0 Z"/></svg>';
function blueWave() {
  document.querySelector(".blue-wash")?.remove();
  const wash = document.createElement("div");
  wash.className = "blue-wash";
  wash.setAttribute("aria-hidden", "true");
  wash.innerHTML = `<div class="wash-wave dark">${WAVE_EDGE}</div><div class="wash-wave black">${WAVE_EDGE}</div>`;
  document.querySelector(".paint-lines").before(wash);
  setTimeout(() => wash.remove(), FLASH_FOR + 600);
}

function popOne() {
  // Pick a bubble that is on the screen right now, so the pop can be seen.
  const onScreen = [...layer.querySelectorAll(".bubble:not(.pop)")].filter(b => {
    const r = b.getBoundingClientRect();
    return r.bottom > 80 && r.top < window.innerHeight - 40 && r.right > 0 && r.left < window.innerWidth;
  });
  const b = onScreen[Math.floor(Math.random() * onScreen.length)];
  if (b) popBubble(b);
}

// Clicking a bubble pops it too. The bubbles sit behind the page, so check where the click
// landed instead, and leave clicks on buttons, links, the designer and the cart alone.
document.addEventListener("click", e => {
  if (e.target.closest("a, button, input, label, canvas, .card, .stage, .drawer, .site-header")) return;
  const hit = [...layer.querySelectorAll(".bubble:not(.pop)")].find(b => {
    const r = b.getBoundingClientRect();
    const rad = r.width / 2;
    return Math.hypot(e.clientX - (r.left + rad), e.clientY - (r.top + rad)) <= rad;
  });
  if (hit) popBubble(hit);
});

blowBubbles();
if (!calm) setInterval(popOne, POP_EVERY);
window.vortexPop = popOne; // handy for trying the effect without waiting 2 minutes
