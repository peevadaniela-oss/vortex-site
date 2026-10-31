// Christmas page: a round ornament with a name in script letters, the year, a theme picture and
// colours, drawn live as an SVG. Adding to the cart is left to app.js: it reads the hidden inputs
// and the #add-ornament button.

// ---- catalog: the "Custom Christmas ornament" product in Wix ----------------------------------
// Leave PRODUCT_ID empty until the product exists in Wix; the button then says orders open soon.
// If the price changes in the Wix dashboard, change it here too (the cart always charges the Wix price).
const ORNAMENT = { PRODUCT_ID: "", VARIANT_ID: "", PRICE: 14 };

const COLOURS = [
  { name: "Christmas red", hex: "#d62828" },
  { name: "Holly green", hex: "#1f9d3a" },
  { name: "Snow white", hex: "#f4f4f8" },
  { name: "Gold", hex: "#e0b030" },
  { name: "Silver", hex: "#c0c2cc" },
  { name: "Midnight black", hex: "#25232f" },
  { name: "Galaxy purple", hex: "#7b4dff" },
  { name: "Sky blue", hex: "#00b3ff" },
  { name: "Hot pink", hex: "#ff4fa3" },
];
const CLEAR = { name: "See-through", hex: "" };
const BACKS = [CLEAR, ...COLOURS];

// Each theme picture is drawn inside a circle of radius 76 around (100, 120).
const STROKE = 'stroke="#1b1424" stroke-width="1.5" stroke-linejoin="round"';
function snowflake(x, y, r, rot = 0) {
  const arm = `<path d="M0 0V${-r}M0 ${-r * 0.45}l${-r * 0.28} ${-r * 0.28}M0 ${-r * 0.45}l${r * 0.28} ${-r * 0.28}M0 ${-r * 0.75}l${-r * 0.2} ${-r * 0.2}M0 ${-r * 0.75}l${r * 0.2} ${-r * 0.2}"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${rot})" fill="none" stroke="#fff" stroke-width="${r * 0.13}" stroke-linecap="round">
    ${[0, 60, 120, 180, 240, 300].map((a) => `<g transform="rotate(${a})">${arm}</g>`).join("")}</g>`;
}
const THEMES = [
  { key: "snowflake", name: "Snowflakes", art: () => snowflake(136, 70, 24, 10) + snowflake(62, 158, 20, -8) + snowflake(68, 78, 13) },
  { key: "candycane", name: "Candy canes", art: () => {
    const cane = "M100 182C88 160 58 128 52 100C46 72 70 58 86 72C96 81 100 92 100 92";
    const stripes = `stroke-width="11" fill="none" stroke-linecap="round"`;
    const one = `<path d="${cane}" stroke="#1b1424" stroke-width="14" fill="none" stroke-linecap="round"/><path d="${cane}" stroke="#fff" ${stripes}/><path d="${cane}" stroke="#d62828" ${stripes} stroke-dasharray="7 7"/>`;
    return `<g>${one}</g><g transform="translate(200 0) scale(-1 1)">${one}</g>
      <path d="M100 160l-26-14v28zM100 160l26-14v28z" fill="#3cc94f" ${STROKE}/><circle cx="100" cy="160" r="7" fill="#2a9d3a" ${STROKE}/>`;
  } },
  { key: "elf", name: "Elf", art: () => `
    <path d="M60 96C64 58 96 40 142 46C128 54 124 70 132 96z" fill="#3cc94f" ${STROKE}/>
    <circle cx="146" cy="46" r="8" fill="#fff" ${STROKE}/>
    <rect x="54" y="88" width="90" height="16" rx="8" fill="#d62828" ${STROKE}/>
    <path d="M58 116l-18-8 14 24zM140 116l18-8-14 24z" fill="#f2c9a5" ${STROKE}/>
    <circle cx="99" cy="128" r="36" fill="#f2c9a5" ${STROKE}/>
    <path d="M62 126C62 186 136 186 136 126C126 146 110 150 99 146C88 150 72 146 62 126z" fill="#f08a24" ${STROKE}/>
    <circle cx="86" cy="118" r="3.5" fill="#1b1424"/><circle cx="112" cy="118" r="3.5" fill="#1b1424"/>
    <circle cx="99" cy="132" r="9" fill="#e0403a" ${STROKE}/>` },
  { key: "tree", name: "Christmas tree", art: () => `
    <rect x="92" y="174" width="16" height="16" fill="#8a5a2b" ${STROKE}/>
    <path d="M100 58L62 112h16L52 150h18L42 178h116l-28-28h18l-26-38h16z" fill="#3cc94f" ${STROKE}/>
    ${[[88, 104], [112, 120], [80, 140], [120, 152], [96, 164], [138, 170], [64, 168], [104, 86]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4" fill="${i % 2 ? "#e0b030" : "#d62828"}"/>`).join("")}
    <path d="M100 42l4.7 9.5 10.5 1.5-7.6 7.4 1.8 10.4-9.4-4.9-9.4 4.9 1.8-10.4-7.6-7.4 10.5-1.5z" fill="#ffd23f" ${STROKE}/>` },
  { key: "train", name: "Train", art: () => `
    <circle cx="66" cy="66" r="9" fill="#fff" ${STROKE}/><circle cx="80" cy="56" r="12" fill="#fff" ${STROKE}/><circle cx="98" cy="50" r="9" fill="#fff" ${STROKE}/>
    <rect x="58" y="76" width="16" height="26" fill="#25232f" ${STROKE}/>
    <rect x="44" y="100" width="74" height="44" rx="6" fill="#25232f" ${STROKE}/>
    <rect x="112" y="72" width="44" height="72" rx="4" fill="#25232f" ${STROKE}/>
    <rect x="120" y="82" width="28" height="22" rx="3" fill="#8fd3ff"/>
    <rect x="106" y="66" width="56" height="10" rx="3" fill="#d62828" ${STROKE}/>
    <path d="M44 144h-14l14-20z" fill="#d62828" ${STROKE}/>
    ${[[62, 156, 13], [98, 156, 13], [136, 152, 17]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#25232f" ${STROKE}/><circle cx="${x}" cy="${y}" r="${r * 0.4}" fill="#c0c2cc"/>`).join("")}` },
  { key: "reindeer", name: "Reindeer", art: () => `
    <path d="M78 88C70 70 54 64 50 46M66 72L52 70M60 60L68 46M122 88C130 70 146 64 150 46M134 72L148 70M140 60L132 46" stroke="#b07a3e" stroke-width="9" stroke-linecap="round" fill="none"/>
    <ellipse cx="66" cy="102" rx="14" ry="8" transform="rotate(-25 66 102)" fill="#c9905a" ${STROKE}/>
    <ellipse cx="134" cy="102" rx="14" ry="8" transform="rotate(25 134 102)" fill="#c9905a" ${STROKE}/>
    <path d="M100 82C130 82 142 110 136 140C130 172 70 172 64 140C58 110 70 82 100 82z" fill="#f1e2cf" ${STROKE}/>
    <circle cx="86" cy="118" r="5" fill="#1b1424"/><circle cx="114" cy="118" r="5" fill="#1b1424"/>
    <ellipse cx="100" cy="148" rx="20" ry="16" fill="#d62828" ${STROKE}/>` },
  { key: "snowman", name: "Snowman", art: () => `
    <circle cx="100" cy="150" r="36" fill="#fff" ${STROKE}/>
    <circle cx="100" cy="94" r="26" fill="#fff" ${STROKE}/>
    <rect x="76" y="64" width="48" height="8" rx="3" fill="#25232f" ${STROKE}/>
    <rect x="84" y="40" width="32" height="28" rx="3" fill="#25232f" ${STROKE}/>
    <rect x="84" y="58" width="32" height="7" fill="#d62828"/>
    <circle cx="100" cy="34" r="6" fill="#d62828" ${STROKE}/>
    <circle cx="91" cy="90" r="3" fill="#1b1424"/><circle cx="109" cy="90" r="3" fill="#1b1424"/>
    <path d="M100 96l18 4-18 4z" fill="#f08a24"/>
    <path d="M78 116h44v10H106l6 22h-12l-4-22H78z" fill="#d62828" ${STROKE}/>
    <circle cx="100" cy="140" r="3" fill="#1b1424"/><circle cx="100" cy="156" r="3" fill="#1b1424"/>` },
];

// starting points, like the ornaments in the photos that inspired this page
const IDEAS = [
  { name: "Paz", theme: "snowflake", ring: "Gold", text: "Snow white", back: "Christmas red", year: false },
  { name: "Amor", theme: "snowflake", ring: "Snow white", text: "Snow white", back: "See-through", year: false },
  { name: "Mateo", theme: "train", ring: "Christmas red", text: "Snow white", back: "See-through", year: true },
  { name: "Sofia", theme: "reindeer", ring: "Christmas red", text: "Holly green", back: "See-through", year: true },
  { name: "Noah", theme: "elf", ring: "Snow white", text: "Midnight black", back: "See-through", year: true },
  { name: "Emma", theme: "snowman", ring: "Holly green", text: "Christmas red", back: "See-through", year: true },
  { name: "Liam", theme: "candycane", ring: "Snow white", text: "Gold", back: "See-through", year: true },
  { name: "Ava", theme: "tree", ring: "Snow white", text: "Christmas red", back: "See-through", year: true },
];

const named = (list, name) => list.find((c) => c.name === name);
const thisYear = String(new Date().getFullYear());
const state = { theme: "snowflake", name: "Amor", yearOn: true, year: thisYear, ring: named(COLOURS, "Snow white"), text: named(COLOURS, "Christmas red"), back: CLEAR };

// ---- controls ---------------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

$("theme-choices").innerHTML = THEMES.map((t) => `
  <button type="button" class="choice" data-theme="${t.key}" aria-pressed="false">
    <svg viewBox="30 30 140 170" aria-hidden="true">${t.art()}</svg>${esc(t.name)}
  </button>`).join("");
const swatches = (group, list) => list.map((c, i) => `
  <button type="button" class="swatch${c.hex ? "" : " clear"}" style="--c:${c.hex || "transparent"}" data-${group}="${i}" aria-pressed="false" aria-label="${esc(c.name)}" title="${esc(c.name)}"></button>`).join("");
$("ring-swatches").innerHTML = swatches("ring", COLOURS);
$("text-swatches").innerHTML = swatches("textc", COLOURS);
$("back-swatches").innerHTML = swatches("back", BACKS);
function ideaState(idea) {
  return { theme: idea.theme, name: idea.name, yearOn: idea.year, year: thisYear,
    ring: named(COLOURS, idea.ring), text: named(COLOURS, idea.text), back: named(BACKS, idea.back) };
}

document.querySelector(".designer-panel").addEventListener("click", (ev) => {
  const b = ev.target.closest("button");
  if (!b) return;
  if (b.dataset.theme) state.theme = b.dataset.theme;
  else if (b.dataset.ring) state.ring = COLOURS[Number(b.dataset.ring)];
  else if (b.dataset.textc) state.text = COLOURS[Number(b.dataset.textc)];
  else if (b.dataset.back) state.back = BACKS[Number(b.dataset.back)];
  else return;
  update();
});
$("ideas").addEventListener("click", (ev) => {
  const b = ev.target.closest("[data-idea]");
  if (!b) return;
  Object.assign(state, ideaState(IDEAS[Number(b.dataset.idea)]));
  $("name-input").value = state.name;
  $("year-on").checked = state.yearOn;
  $("year-input").value = state.year;
  update();
});
$("name-input").value = state.name;
$("name-input").addEventListener("input", (ev) => {
  state.name = ev.target.value.replace(/\s+/g, " ").trimStart();
  update();
});
$("year-input").value = state.year;
$("year-input").addEventListener("input", (ev) => {
  ev.target.value = ev.target.value.replace(/\D/g, "");
  state.year = ev.target.value;
  update();
});
$("year-on").addEventListener("change", (ev) => { state.yearOn = ev.target.checked; update(); });

// ---- the ornament -----------------------------------------------------------------------------
// Light colours get a dark outline so they stay readable on a white or see-through ornament.
const isLight = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 170;
};
function ornamentSvg(s) {
  const theme = THEMES.find((t) => t.key === s.theme);
  const name = s.name.trim();
  const year = s.yearOn && /^\d{4}$/.test(s.year) ? s.year : "";
  const size = Math.min(54, 300 / Math.max(name.length, 3));
  const outline = isLight(s.text.hex) ? "#1b1424" : "#ffffff";
  const ringEdge = isLight(s.ring.hex) ? "#8a8494" : "#1b1424";
  return `
    <defs><clipPath id="inside${s.small ? "-s" : ""}"><circle cx="100" cy="120" r="80"/></clipPath>
      <filter id="lift${s.small ? "-s" : ""}"><feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity=".45"/></filter></defs>
    <circle cx="100" cy="21" r="10" fill="none" stroke="${s.ring.hex}" stroke-width="6"/>
    <circle cx="100" cy="21" r="13" fill="none" stroke="${ringEdge}" stroke-width="1" opacity=".6"/>
    ${s.back.hex ? `<circle cx="100" cy="120" r="84" fill="${s.back.hex}"/>` : ""}
    <g clip-path="url(#inside${s.small ? "-s" : ""})">${theme.art()}</g>
    <circle cx="100" cy="120" r="88" fill="none" stroke="${ringEdge}" stroke-width="13"/>
    <circle cx="100" cy="120" r="88" fill="none" stroke="${s.ring.hex}" stroke-width="10"/>
    <g filter="url(#lift${s.small ? "-s" : ""})" font-family="'Dancing Script', cursive" font-weight="700" fill="${s.text.hex}"
       stroke="${outline}" stroke-width="1.6" paint-order="stroke" stroke-linejoin="round">
      ${name ? `<text x="100" y="${year ? 126 : 136}" text-anchor="middle" font-size="${size}">${esc(name)}</text>` : ""}
      ${year ? `<text x="${name ? 132 : 100}" y="${name ? 174 : 136}" text-anchor="middle" font-size="${name ? 28 : 44}"${name ? ' transform="rotate(-8 132 174)"' : ""}>${year}</text>` : ""}
    </g>`;
}

function update() {
  const theme = THEMES.find((t) => t.key === state.theme);
  const name = state.name.trim();
  const yearOk = !state.yearOn || /^\d{4}$/.test(state.year);
  for (const b of document.querySelectorAll("[data-theme]")) b.setAttribute("aria-pressed", String(b.dataset.theme === state.theme));
  for (const b of document.querySelectorAll("[data-ring]")) b.setAttribute("aria-pressed", String(COLOURS[b.dataset.ring] === state.ring));
  for (const b of document.querySelectorAll("[data-textc]")) b.setAttribute("aria-pressed", String(COLOURS[b.dataset.textc] === state.text));
  for (const b of document.querySelectorAll("[data-back]")) b.setAttribute("aria-pressed", String(BACKS[b.dataset.back] === state.back));
  $("theme-name").textContent = theme.name;
  $("ring-name").textContent = state.ring.name;
  $("text-name").textContent = state.text.name;
  $("back-name").textContent = state.back.name;
  $("year-input").disabled = !state.yearOn;
  $("name-hint").textContent = name ? `${12 - state.name.length} letters left.` : "Type a name or a word, like Amor, Paz or Noel.";
  $("ornament").innerHTML = ornamentSvg(state);
  $("ornament").setAttribute("aria-label", `Preview: ${theme.name.toLowerCase()} ornament${name ? ` that says ${name}` : ""}`);

  $("price").textContent = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(ORNAMENT.PRICE);
  const yearText = state.yearOn && yearOk ? ` and ${state.year}` : "";
  $("summary").textContent = `${theme.name} ornament${name ? ` with “${name}”${yearText}` : ""}, ${state.ring.name.toLowerCase()} ring`;

  // what app.js sends to the cart
  $("f-name").value = name;
  $("f-year").value = state.yearOn && yearOk ? state.year : "";
  $("f-theme").value = theme.name;
  $("f-colours").value = `Ring: ${state.ring.name} · Letters: ${state.text.name} · Background: ${state.back.name}`;
  const btn = $("add-ornament");
  btn.dataset.add = ORNAMENT.PRODUCT_ID;
  btn.dataset.variant = ORNAMENT.VARIANT_ID;
  btn.disabled = !ORNAMENT.PRODUCT_ID || !yearOk;
  btn.textContent = !ORNAMENT.PRODUCT_ID ? "Orders open soon" : yearOk ? "Add to cart" : "Type a 4-digit year";
}

$("ideas").innerHTML = IDEAS.map((idea, i) => `
  <button type="button" class="idea-chip" data-idea="${i}" title="${esc(idea.name)}">
    <svg viewBox="0 0 200 222" aria-hidden="true">${ornamentSvg({ ...ideaState(idea), small: true })}</svg>
    <span>${esc(idea.name)}</span>
  </button>`).join("");
update();
// redraw once the script font has loaded, so the preview uses it
document.fonts?.load("700 40px 'Dancing Script'").then(update).catch(() => {});
