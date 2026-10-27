// Kinetic home section: scroll-driven marquees, wave-jumping toy names, and a preview card
// that follows the cursor while you hover a name.
(function () {
  const section = document.querySelector(".kinetic");
  if (!section) return;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Marquees: drift on their own, speed up with scrolling (and reverse with it).
  const rows = [...section.querySelectorAll(".marquee")].map((el) => {
    const track = el.querySelector(".marquee-track");
    track.innerHTML = track.innerHTML.repeat(6);
    return { track, speed: Number(el.dataset.speed) || 1, x: 0 };
  });
  let lastY = window.scrollY, boost = 0;
  window.addEventListener("scroll", () => {
    boost += (window.scrollY - lastY) * 0.6;
    lastY = window.scrollY;
  }, { passive: true });
  function tick() {
    boost *= 0.9;
    for (const r of rows) {
      const half = r.track.scrollWidth / 2;
      r.x -= r.speed * (1.2 + Math.abs(boost) * 0.15) * Math.sign(boost || 1);
      if (half) r.x = ((r.x % half) - half) % half;
      r.track.style.transform = `translateX(${r.x}px) skewX(${Math.max(-12, Math.min(12, -boost * 0.4))}deg)`;
    }
    requestAnimationFrame(tick);
  }
  if (!still) requestAnimationFrame(tick);

  // Toy names: split into letters that jump in a wave on hover.
  for (const a of section.querySelectorAll(".toy-list a")) {
    const text = a.textContent;
    a.setAttribute("aria-label", text);
    a.innerHTML = [...text].map((ch, i) =>
      `<span class="ch" aria-hidden="true" style="--i:${i}">${ch === " " ? "&nbsp;" : ch}</span>`).join("");
  }

  // Preview card that trails the cursor.
  const peek = section.querySelector(".toy-peek");
  const card = peek.querySelector(".toy-peek-card");
  const tag = peek.querySelector(".toy-peek-tag");
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!fine) return;
  let tx = 0, ty = 0, px = 0, py = 0, on = false;
  section.addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; });
  for (const a of section.querySelectorAll(".toy-list a")) {
    a.addEventListener("pointerenter", () => {
      on = true;
      card.style.setProperty("--peek", a.dataset.color);
      tag.textContent = a.dataset.tag;
      peek.classList.add("show");
    });
    a.addEventListener("pointerleave", () => { on = false; peek.classList.remove("show"); });
  }
  function follow() {
    px += (tx - px) * 0.15;
    py += (ty - py) * 0.15;
    const tilt = Math.max(-15, Math.min(15, (tx - px) * 0.3));
    peek.style.transform = `translate(${px + 24}px, ${py - 90}px) rotate(${tilt}deg)`;
    requestAnimationFrame(follow);
  }
  requestAnimationFrame(follow);
})();
