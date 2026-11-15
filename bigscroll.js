// A big, easy-to-grab scroll handle for phones and tablets.
// Drag it up or down to move through the page; tap the arrows above and below it to jump a screen.
(() => {
  if (!matchMedia("(pointer: coarse)").matches) return; // mouse users get the thick scrollbar in styles.css

  const rail = document.createElement("div");
  rail.className = "big-scroll";
  rail.innerHTML = `
    <button type="button" class="big-scroll-step" data-dir="-1" aria-label="Scroll up">▲</button>
    <div class="big-scroll-track"><div class="big-scroll-thumb" role="scrollbar" aria-label="Drag to scroll" aria-orientation="vertical" tabindex="-1"><span></span><span></span><span></span></div></div>
    <button type="button" class="big-scroll-step" data-dir="1" aria-label="Scroll down">▼</button>`;
  document.body.appendChild(rail);
  const track = rail.querySelector(".big-scroll-track");
  const thumb = rail.querySelector(".big-scroll-thumb");

  const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
  const room = () => track.clientHeight - thumb.offsetHeight;
  let hideTimer = 0;

  const header = document.querySelector(".site-header");
  function place() {
    if (header) rail.style.top = `${header.getBoundingClientRect().bottom + 8}px`;
    const max = maxScroll();
    rail.hidden = max < 200; // short page: nothing to scroll
    if (rail.hidden) return;
    const ratio = Math.min(1, Math.max(0, scrollY / max));
    thumb.style.transform = `translateY(${ratio * room()}px)`;
    thumb.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
  }
  function wake() {
    rail.classList.add("awake");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => rail.classList.remove("awake"), 2500);
  }

  let grab = null;
  thumb.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    thumb.setPointerCapture(e.pointerId);
    const top = thumb.getBoundingClientRect().top;
    grab = { offset: e.clientY - top };
    rail.classList.add("dragging");
    wake();
  });
  thumb.addEventListener("pointermove", (e) => {
    if (!grab) return;
    const y = e.clientY - track.getBoundingClientRect().top - grab.offset;
    const ratio = Math.min(1, Math.max(0, y / Math.max(1, room())));
    scrollTo({ top: ratio * maxScroll(), behavior: "instant" });
    wake();
  });
  const drop = () => { grab = null; rail.classList.remove("dragging"); };
  thumb.addEventListener("pointerup", drop);
  thumb.addEventListener("pointercancel", drop);

  rail.addEventListener("click", (e) => {
    const step = e.target.closest(".big-scroll-step");
    if (!step) return;
    scrollBy({ top: Number(step.dataset.dir) * innerHeight * 0.8, behavior: "smooth" });
    wake();
  });

  addEventListener("scroll", () => { place(); wake(); }, { passive: true });
  addEventListener("resize", place);
  new ResizeObserver(place).observe(document.body);
  place();
})();
