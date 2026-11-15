// Home and Shop: show one of the photo shapes (dragons, letters, organizers), a different one on
// each visit. It links to the Create-your-own section that shows all of them.
import { SHAPES, VARIANTS } from "./catalog.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const picks = SHAPES.filter((s) => s.photo);

for (const el of document.querySelectorAll("[data-featured]")) {
  const s = picks[Math.floor(Math.random() * picks.length)];
  el.href = "create.html#starters";
  el.innerHTML = `
    <img src="${esc(s.photo)}" alt="${esc(s.credit ? `${s.name} by ${s.credit.by}` : `A ${s.name.toLowerCase()} we printed`)}">
    <span class="featured-tag">Make it yours · from ${money(VARIANTS[s.key].Small[1])}</span>
    <span class="featured-name">${esc(s.name)}<small>See all ${picks.length} →</small></span>`;
}
