// Christmas page: ornaments and decorations people personalise with names, the year and colours,
// each drawn live as an SVG. Adding to the cart is left to app.js: it reads the hidden inputs and
// the #add-xmas button.

// ---- catalog: each item below is its own Wix product (PRODUCTS[].wix = [product id, variant id]) --
// Each one has three free-text fields: Names, Year and Details. Leave wix empty until the product
// exists in Wix; the button then says orders open soon. If a price changes in the Wix dashboard,
// change it here too (the cart always charges the Wix price).

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

// ---- drawing helpers (every item is drawn in a 200 × 222 box) ---------------------------------
const SCRIPT = "'Dancing Script', cursive";
const BLOCK = "'Baloo 2', 'Nunito', sans-serif";
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const isLight = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 170;
};
const shade = (hex, f = 0.65) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${[n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * f)).join(",")})`;
};
// dark edge for light colours, so white and silver prints stay visible
const edge = (hex) => (isLight(hex) ? "#8a8494" : "#1b1424");
// font size that fits a word into a width (k is the average letter width for that font)
const fit = (str, width, max, k) => Math.min(max, width / (Math.max(str.length, 2) * k));
// letters with an outline in the opposite tone, so they read on any colour
function words(str, x, y, size, fill, { font = SCRIPT, weight = 700, transform = "", length = 0 } = {}) {
  if (!str) return "";
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="${font}" font-weight="${weight}" font-size="${size.toFixed(1)}" fill="${fill}"
    stroke="${isLight(fill) ? "#1b1424" : "#ffffff"}" stroke-width="${Math.max(1, size / 26).toFixed(1)}" paint-order="stroke" stroke-linejoin="round"
    ${transform ? `transform="${transform}"` : ""} ${length ? `textLength="${length}" lengthAdjust="spacingAndGlyphs"` : ""}>${esc(str)}</text>`;
}
const loop = (x, y, c) => `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="${edge(c)}" stroke-width="7"/><circle cx="${x}" cy="${y}" r="8" fill="none" stroke="${c}" stroke-width="5"/>`;
const DEFS = `<defs><clipPath id="inside"><circle cx="100" cy="120" r="80"/></clipPath>
  <filter id="lift"><feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity=".45"/></filter>
  <filter id="glow"><feGaussianBlur stdDeviation="4"/></filter></defs>`;
const santaHat = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-22 0C-18 -30 10 -40 30 -22L22 -14C14 -22 4 -20 2 0z" fill="#d62828" ${STROKE}/>
  <rect x="-26" y="-4" width="34" height="10" rx="5" fill="#fff" ${STROKE}/><circle cx="30" cy="-20" r="6" fill="#fff" ${STROKE}/></g>`;
const year = (s) => (s.yearOn && /^\d{4}$/.test(s.year) ? s.year : "");
const names = (s) => s.texts.map((t) => t.trim()).filter(Boolean);

// ---- the items --------------------------------------------------------------------------------
// texts: what people type (the first is required when required is set), year: whether a year can be
// added (and if it starts switched on), slots: the colour choices, with the colour each starts on.
const PRODUCTS = [
  { key: "round", name: "Round name ornament", price: 14, wix: ["f008bc2d-cb4b-4508-af35-06b8e172c57f", "a3af41b6-9c2a-4a9f-8a4e-0126000cf1dc"], hangs: true, size: "About 8 cm across", theme: true,
    texts: [{ label: "Name or word", max: 12, def: "Amor", hint: "e.g. Amor, Paz or Mia", required: true }], year: true,
    slots: [{ key: "ring", label: "Ring", def: "Snow white" }, { key: "text", label: "Letters and year", def: "Christmas red" }, { key: "back", label: "Background", def: "See-through", backs: true }],
    draw(s) {
      const theme = THEMES.find((t) => t.key === s.theme), name = names(s)[0] ?? "", y = year(s);
      const { ring, text, back } = s.c;
      return `${loop(100, 21, ring.hex)}
        ${back.hex ? `<circle cx="100" cy="120" r="84" fill="${back.hex}"/>` : ""}
        <g clip-path="url(#inside)">${theme.art()}</g>
        <circle cx="100" cy="120" r="88" fill="none" stroke="${edge(ring.hex)}" stroke-width="13"/>
        <circle cx="100" cy="120" r="88" fill="none" stroke="${ring.hex}" stroke-width="10"/>
        <g filter="url(#lift)">${words(name, 100, y ? 126 : 136, fit(name, 150, 54, 0.5), text.hex)}
        ${y ? words(y, name ? 132 : 100, name ? 174 : 136, name ? 28 : 44, text.hex, { transform: name ? "rotate(-8 132 174)" : "" }) : ""}</g>`;
    } },
  { key: "paw", name: "Pet paw ornament", price: 12, wix: [], hangs: true, size: "About 8 cm tall",
    texts: [{ label: "Pet's name", max: 10, def: "Luna", hint: "e.g. Luna, Max or Coco", required: true }], year: false,
    slots: [{ key: "paw", label: "Paw", def: "Christmas red" }, { key: "text", label: "Letters", def: "Snow white" }],
    draw(s) {
      const { paw, text } = s.c, rim = isLight(paw.hex) ? "#c0c2cc" : "#fff", name = names(s)[0] ?? "", y = year(s);
      const toes = [[48, 98, 20], [80, 66, 21], [120, 66, 21], [152, 98, 20]];
      const pad = "M100 106C142 106 170 136 166 166C162 196 132 202 100 192C68 202 38 196 34 166C30 136 58 106 100 106z";
      const shapes = (fill, stroke, w) => toes.map(([x, yy, r]) => `<circle cx="${x}" cy="${yy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`).join("") + `<path d="${pad}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;
      return `${loop(100, 34, paw.hex)}${shapes(rim, "#1b1424", 12)}${shapes(paw.hex, rim, 6)}
        ${toes.map(([x, yy]) => snowflake(x, yy, 9)).join("")}
        <g filter="url(#lift)">${words(name, 100, y ? 160 : 166, fit(name, 112, 42, 0.5), text.hex)}${y ? words(y, 100, 184, 16, text.hex, { font: BLOCK, weight: 800 }) : ""}</g>`;
    } },
  { key: "bone", name: "Dog bone ornament", price: 12, wix: [], hangs: true, size: "About 10 cm wide",
    texts: [{ label: "Dog's name", max: 8, def: "Max", hint: "e.g. Max, Coco or Teddy", required: true }], year: true,
    slots: [{ key: "bone", label: "Bone", def: "Christmas red" }, { key: "text", label: "Letters and year", def: "Snow white" }],
    draw(s) {
      const { bone, text } = s.c, rim = isLight(bone.hex) ? "#c0c2cc" : "#fff", name = names(s)[0] ?? "", y = year(s);
      const ends = [[42, 96], [42, 150], [158, 96], [158, 150]];
      const shape = (fill, stroke, w) => `<g fill="${fill}" stroke="${stroke}" stroke-width="${w}">${ends.map(([x, yy]) => `<circle cx="${x}" cy="${yy}" r="26"/>`).join("")}</g>`
        + `<rect x="42" y="98" width="116" height="50" fill="${fill}"/>`;
      return `${loop(100, 86, bone.hex)}${shape(rim, "#1b1424", 12)}<rect x="42" y="90" width="116" height="66" fill="#1b1424"/><rect x="42" y="94" width="116" height="58" fill="${rim}"/>
        ${shape(bone.hex, rim, 6)}<rect x="42" y="97" width="116" height="52" fill="${bone.hex}"/>
        ${santaHat(36, 80, 0.9)}
        <g filter="url(#lift)">${words(name.toUpperCase(), 102, 140, fit(name, 110, 42, 0.62), text.hex, { font: BLOCK, weight: 800 })}
        ${y ? words(y, 100, 112, 15, text.hex, { font: BLOCK, weight: 800 }) : ""}</g>`;
    } },
  { key: "flake", name: "Snowflake name ornament", price: 14, wix: [], hangs: true, size: "About 9 cm across",
    texts: [{ label: "Name or word", max: 10, def: "Mia", hint: "e.g. Mia, Leo or Joy", required: true }], year: false,
    slots: [{ key: "flake", label: "Snowflake", def: "Snow white" }, { key: "text", label: "Letters", def: "Christmas red" }],
    draw(s) {
      const { flake, text } = s.c, name = names(s)[0] ?? "", y = year(s);
      const arm = "M0 0V-84M0 -38l-24 -22M0 -38l24 -22M0 -62l-17 -15M0 -62l17 -15";
      const arms = (c, w) => [0, 60, 120, 180, 240, 300].map((a) => `<path d="${arm}" transform="translate(100 120) rotate(${a})" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
      return `${loop(100, 28, flake.hex)}${arms(edge(flake.hex), 17)}${arms(flake.hex, 13)}
        <polygon points="${[0, 60, 120, 180, 240, 300].map((a) => `${100 + 30 * Math.sin(a * Math.PI / 180)},${120 - 30 * Math.cos(a * Math.PI / 180)}`).join(" ")}" fill="${flake.hex}" stroke="${edge(flake.hex)}" stroke-width="2"/>
        <g filter="url(#lift)">${words(name, 100, 136, fit(name, 160, 50, 0.48), text.hex)}${y ? words(y, 100, 172, 20, text.hex, { font: BLOCK, weight: 800 }) : ""}</g>`;
    } },
  { key: "cane", name: "Candy cane name ornament", price: 12, wix: [], hangs: true, size: "About 10 cm tall",
    texts: [{ label: "Name", max: 9, def: "Leo", hint: "e.g. Leo, Emma or Nina", required: true }], year: false,
    slots: [{ key: "stripes", label: "Stripes", def: "Christmas red" }, { key: "text", label: "Letters", def: "Holly green" }],
    draw(s) {
      const { stripes, text } = s.c, name = names(s)[0] ?? "", y = year(s);
      const cane = "M76 206L116 96C128 58 170 52 176 88C179 104 170 114 160 118";
      const line = (c, w, dash = "") => `<path d="${cane}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${dash}/>`;
      return `${loop(150, 38, "#f4f4f8")}${line("#1b1424", 34)}${line("#ffffff", 30)}${line(stripes.hex, 30, 'stroke-dasharray="12 12"')}
        <g filter="url(#lift)">${words(name, 96, 160, fit(name, 130, 48, 0.46), text.hex, { transform: "rotate(-70 96 152)" })}
        ${y ? words(y, 150, 196, 20, text.hex, { font: BLOCK, weight: 800 }) : ""}</g>`;
    } },
  { key: "family", name: "Family tree ornament", price: 22, wix: [], hangs: true, size: "About 10 cm tall",
    texts: [
      { label: "Name 1", max: 10, def: "Mia", required: true }, { label: "Name 2", max: 10, def: "Leo" },
      { label: "Name 3", max: 10, def: "Emma" }, { label: "Name 4", max: 10, def: "" },
      { label: "Family line", max: 14, def: "Our family", hint: "The bottom plaque, e.g. Our family or The Smiths" }], year: true,
    slots: [{ key: "tree", label: "Tree", def: "Holly green" }, { key: "plaque", label: "Name plaques", def: "Snow white" }, { key: "text", label: "Letters", def: "Midnight black" }],
    draw(s) {
      const { tree, plaque, text } = s.c, y = year(s);
      const lines = s.texts.map((t) => t.trim()).filter(Boolean);
      const n = Math.max(lines.length, 1), gap = 116 / n, h = Math.min(24, gap - 5);
      return `${loop(100, 14, "#e0b030")}
        <path d="M100 34L28 194H172z" fill="${tree.hex}" fill-opacity=".35" stroke="${tree.hex}" stroke-width="6" stroke-linejoin="round"/>
        <rect x="90" y="194" width="20" height="16" fill="#8a5a2b" ${STROKE}/>
        <path d="M100 18l5 10 11 1.6-8 7.8 2 11-10-5.2-10 5.2 2-11-8-7.8 11-1.6z" fill="#ffd23f" ${STROKE}/>
        ${y ? words(y, 100, 66, 13, text.hex, { font: BLOCK, weight: 800 }) : ""}
        ${lines.map((line, i) => {
          const cy = 76 + (i + 0.5) * gap, w = 2 * ((cy - 34) / 160) * 72 - 12;
          return `<rect x="${100 - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="6" fill="${plaque.hex}" stroke="${edge(plaque.hex)}" stroke-width="1.5"/>
            ${words(line, 100, cy + h * 0.3, Math.min(h * 0.8, fit(line, w - 10, 20, 0.5)), text.hex)}`;
        }).join("")}`;
    } },
  { key: "nametree", name: "Name tree ornament", price: 16, wix: [], hangs: true, size: "About 9 cm tall",
    texts: [{ label: "Top name", max: 8, def: "Mia", required: true }, { label: "Middle name", max: 8, def: "Alex" }, { label: "Bottom name", max: 8, def: "Sofia" }], year: true,
    slots: [{ key: "text", label: "Names", def: "Christmas red" }, { key: "star", label: "Star and year", def: "Holly green" }],
    draw(s) {
      const { text, star } = s.c, list = names(s), y = year(s), n = Math.max(list.length, 1);
      const rows = list.map((w, i) => words(w.toUpperCase(), 100, 80 + i * 38, 36, text.hex,
        { font: BLOCK, weight: 800, length: 60 + (n > 1 ? (i * 96) / (n - 1) : 48) })).join("");
      return `${loop(100, 12, star.hex)}
        <path d="M100 22l7 14 15 2-11 11 3 15-14-7-14 7 3-15-11-11 15-2z" fill="${star.hex}" stroke="${edge(star.hex)}" stroke-width="1.5"/>
        <g filter="url(#lift)">${rows}${y ? words(y, 100, 80 + n * 38, 26, star.hex, { font: BLOCK, weight: 800, length: 58 }) : ""}</g>`;
    } },
  { key: "stand", name: "Family name stand", price: 26, wix: [], hangs: false, size: "About 15 cm tall",
    texts: [{ label: "First name", max: 8, def: "Emma", required: true }, { label: "Second name", max: 8, def: "Leo" }], year: true,
    slots: [{ key: "text", label: "Names", def: "Sky blue" }, { key: "yr", label: "Year", def: "Snow white" }, { key: "star", label: "Star", def: "Gold" }],
    draw(s) {
      const { text, yr, star } = s.c, list = names(s), y = year(s);
      const rows = [...list.map((w) => [w.toUpperCase(), text.hex]), ...(y ? [[y, yr.hex]] : [])];
      const top = 200 - rows.length * 46;
      const block = (str, cy, c) => `<text x="103" y="${cy + 4}" text-anchor="middle" font-family="${BLOCK}" font-weight="800" font-size="52" fill="${shade(c, 0.55)}" textLength="160" lengthAdjust="spacingAndGlyphs">${esc(str)}</text>
        ${words(str, 100, cy, 52, c, { font: BLOCK, weight: 800, length: 160 })}`;
      return `<path d="M100 ${top - 46}l9 18 20 3-14 14 3 20-18-9-18 9 3-20-14-14 20-3z" fill="${star.hex}" stroke="${edge(star.hex)}" stroke-width="2"/>
        ${rows.map(([str, c], i) => block(str, top + 40 + i * 46, c)).join("")}
        <rect x="16" y="204" width="168" height="10" rx="4" fill="${shade(text.hex, 0.45)}"/>`;
    } },
  { key: "sign", name: "Merry Christmas sign", price: 18, wix: [], hangs: false, size: "About 18 cm wide",
    texts: [{ label: "Words", max: 16, def: "Merry Christmas", hint: "Or a family name, e.g. The Smiths", required: true }], year: false,
    slots: [{ key: "text", label: "Letters", def: "Christmas red" }],
    draw(s) {
      const { text } = s.c, w = names(s)[0] ?? "", sp = w.indexOf(" ");
      // long words go on two lines, like the chunky signs
      const lines = w.length > 9 && sp > 0 ? [w.slice(0, sp), w.slice(sp + 1)] : [w];
      const longest = Math.max(...lines.map((l) => l.length), 2), size = Math.min(70, 176 / (longest * 0.44));
      const half = Math.min(90, (lines.at(-1).length * size * 0.44) / 2 + 6), base = 96 + lines.length * size * 0.8;
      const line = (l, i) => {
        const y = base - (lines.length - 1 - i) * size * 0.85 - 8;
        return `<text x="102" y="${y + 3}" text-anchor="middle" font-family="${SCRIPT}" font-weight="700" font-size="${size.toFixed(1)}" fill="${shade(text.hex, 0.55)}">${esc(l)}</text>${words(l, 100, y, size, text.hex)}`;
      };
      return `<rect x="${100 - half}" y="${base - 6}" width="${2 * half}" height="12" rx="6" fill="${text.hex}" stroke="${edge(text.hex)}" stroke-width="1.5"/>
        <rect x="${100 - half}" y="${base + 6}" width="${2 * half}" height="6" rx="3" fill="${shade(text.hex, 0.5)}"/>
        ${lines.map(line).join("")}
        ${w ? santaHat(100 + half - 16, base - 8 - size * 0.62, size / 46) : ""}`;
    } },
  { key: "bow", name: "Bow candle holder", price: 15, wix: [], hangs: false, size: "About 9 cm wide · for a battery tea light",
    texts: [], slots: [{ key: "bow", label: "Bow", def: "Christmas red" }],
    draw(s) {
      const { bow } = s.c, dark = shade(bow.hex, 0.7);
      const half = `<path d="M96 118C70 66 18 70 24 112C28 144 74 138 96 126z" fill="${bow.hex}" stroke="${edge(bow.hex)}" stroke-width="2"/>
        <path d="M90 122C66 92 40 92 38 112" fill="none" stroke="${dark}" stroke-width="3"/>
        <path d="M90 130L58 196L76 190L84 206L104 134z" fill="${dark}" stroke="${edge(bow.hex)}" stroke-width="2"/>`;
      return `${half}<g transform="translate(200 0) scale(-1 1)">${half}</g>
        <rect x="74" y="98" width="52" height="44" rx="14" fill="${bow.hex}" stroke="${edge(bow.hex)}" stroke-width="2"/>
        <ellipse cx="100" cy="104" rx="20" ry="6" fill="#f4f4f8" stroke="#8a8494"/>
        <ellipse cx="100" cy="82" rx="14" ry="18" fill="#ffbf00" opacity=".5" filter="url(#glow)"/>
        <path d="M100 66C109 80 108 92 100 98C92 92 91 80 100 66z" fill="#ffbf00"/><path d="M100 80C104 88 103 93 100 96C97 93 96 88 100 80z" fill="#fff6c2"/>`;
    } },
  { key: "hearts", name: "Heart photo holders (pair)", price: 16, wix: [], hangs: false, size: "About 8 cm tall · fits a 6 × 9 cm photo",
    texts: [], slots: [{ key: "heart", label: "Hearts", def: "Christmas red" }],
    draw(s) {
      const { heart } = s.c;
      const photo = (x, y, w, h, rot, sky) => `<g transform="rotate(${rot} ${x + w / 2} ${y + h})">
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#8a8494"/>
        <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 16}" fill="${sky}"/>
        <path d="M${x + 4} ${y + h - 12}l${w * 0.3} ${-h * 0.35} ${w * 0.2} ${h * 0.18} ${w * 0.15} ${-h * 0.1} ${w * 0.27} ${h * 0.27}z" fill="#3a7d44"/>
        <circle cx="${x + w * 0.7}" cy="${y + h * 0.25}" r="${w * 0.08}" fill="#ffd23f"/></g>`;
      const hrt = (x, y, sc) => `<path transform="translate(${x} ${y}) scale(${sc})" d="M0 30C-30 10 -44 -6 -36 -22C-28 -36 -10 -34 0 -20C10 -34 28 -36 36 -22C44 -6 30 10 0 30z"
        fill="${heart.hex}" stroke="${edge(heart.hex)}" stroke-width="${2 / sc}"/>`;
      return `${photo(32, 40, 66, 92, -4, "#8fd3ff")}${hrt(64, 160, 1.15)}${photo(118, 76, 54, 74, 5, "#ffc6a8")}${hrt(146, 174, 0.95)}`;
    } },
];

// starting points for the round ornament
const IDEAS = [
  { name: "Paz", theme: "snowflake", c: { ring: "Gold", text: "Snow white", back: "Christmas red" }, year: false },
  { name: "Amor", theme: "snowflake", c: { ring: "Snow white", text: "Snow white", back: "See-through" }, year: false },
  { name: "Leo", theme: "train", c: { ring: "Christmas red", text: "Snow white", back: "See-through" }, year: true },
  { name: "Mia", theme: "reindeer", c: { ring: "Christmas red", text: "Holly green", back: "See-through" }, year: true },
  { name: "Max", theme: "elf", c: { ring: "Snow white", text: "Midnight black", back: "See-through" }, year: true },
  { name: "Emma", theme: "snowman", c: { ring: "Holly green", text: "Christmas red", back: "See-through" }, year: true },
  { name: "Luna", theme: "candycane", c: { ring: "Snow white", text: "Gold", back: "See-through" }, year: true },
  { name: "Alex", theme: "tree", c: { ring: "Snow white", text: "Christmas red", back: "See-through" }, year: true },
];

// ---- state: each item keeps its own choices, so switching back and forth loses nothing ---------
const named = (list, name) => list.find((c) => c.name === name);
const thisYear = String(new Date().getFullYear());
const fresh = (p) => ({
  texts: p.texts.map((t) => t.def), yearOn: p.year === true, year: thisYear, theme: "snowflake",
  c: Object.fromEntries(p.slots.map((sl) => [sl.key, named(sl.backs ? BACKS : COLOURS, sl.def)])),
});
const states = Object.fromEntries(PRODUCTS.map((p) => [p.key, fresh(p)]));
let product = PRODUCTS.find((p) => p.key === new URLSearchParams(location.search).get("item")) ?? PRODUCTS[0];
const st = () => states[product.key];
const svg = (p, s) => DEFS + p.draw(s);

// ---- controls ---------------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);

$("xmas-items").innerHTML = PRODUCTS.map((p) => `
  <button type="button" class="idea-chip" data-product="${p.key}" aria-pressed="false">
    <svg viewBox="0 0 200 222" aria-hidden="true">${svg(p, fresh(p))}</svg>
    <span>${esc(p.name)}</span><small>$${p.price}</small>
  </button>`).join("");

function buildSteps() {
  const p = product, s = st();
  let n = 1;
  const step = (title, body, picked = "") => `<fieldset class="step"><legend><b>${++n}</b> ${title} ${picked}</legend>${body}</fieldset>`;
  const swatches = (key, list) => `<div class="swatches small">${list.map((c, i) => `
    <button type="button" class="swatch${c.hex ? "" : " clear"}" style="--c:${c.hex || "transparent"}" data-slot="${key}" data-ci="${i}" aria-pressed="false" aria-label="${esc(c.name)}" title="${esc(c.name)}"></button>`).join("")}</div>`;
  let html = "";
  if (p.theme) {
    html += step("Pick a theme", `
      <div class="choices themes">${THEMES.map((t) => `
        <button type="button" class="choice" data-theme="${t.key}" aria-pressed="false">
          <svg viewBox="30 30 140 170" aria-hidden="true">${t.art()}</svg>${esc(t.name)}
        </button>`).join("")}</div>
      <div class="examples"><span class="sub">Or start from an idea:</span>${IDEAS.map((idea, i) => `<button type="button" class="chip" data-idea="${i}">${esc(idea.name)}</button>`).join("")}</div>`,
      `<span class="picked" id="theme-name"></span>`);
  }
  if (p.texts.length) {
    html += step(p.texts.length > 1 ? "Names" : esc(p.texts[0].label), p.texts.map((t, i) => `
      <label class="custom-field">${p.texts.length > 1 ? `${esc(t.label)}${t.required ? "" : " <span class=\"sub\">(optional)</span>"}` : "Your text"}
        <input type="text" data-ti="${i}" maxlength="${t.max}" placeholder="${esc(t.hint ?? "")}" value="${esc(s.texts[i])}" autocomplete="off">
      </label>`).join("") + `<p class="hint">Up to ${Math.max(...p.texts.map((t) => t.max))} letters each.</p>`);
  }
  if (p.year !== undefined) {
    html += step("The year", `
      <div class="year-row">
        <label class="toggle"><input type="checkbox" id="year-on" ${s.yearOn ? "checked" : ""}> Add the year</label>
        <label class="custom-field year-field">Year <input type="text" id="year-input" inputmode="numeric" maxlength="4" value="${esc(s.year)}" autocomplete="off"></label>
      </div>`, `<span class="picked">(optional)</span>`);
  }
  html += step(p.slots.length > 1 ? "Colours" : "Colour", p.slots.map((sl) => `
    <span class="sub">${esc(sl.label)} <span class="picked" data-slot-name="${sl.key}"></span></span>
    ${swatches(sl.key, sl.backs ? BACKS : COLOURS)}`).join(""));
  $("steps").innerHTML = html;
  $("f-names").dataset.required = String(p.texts.some((t) => t.required));
}

$("xmas-items").addEventListener("click", (ev) => {
  const b = ev.target.closest("[data-product]");
  if (!b) return;
  product = PRODUCTS.find((p) => p.key === b.dataset.product);
  history.replaceState(null, "", `?item=${product.key}`);
  buildSteps();
  update();
  if (matchMedia("(max-width: 860px)").matches) $("stage").scrollIntoView({ behavior: "smooth", block: "start" });
});
$("steps").addEventListener("click", (ev) => {
  const b = ev.target.closest("button");
  if (!b) return;
  const s = st();
  if (b.dataset.theme) s.theme = b.dataset.theme;
  else if (b.dataset.slot) {
    const sl = product.slots.find((x) => x.key === b.dataset.slot);
    s.c[sl.key] = (sl.backs ? BACKS : COLOURS)[Number(b.dataset.ci)];
  } else if (b.dataset.idea) {
    const idea = IDEAS[Number(b.dataset.idea)];
    Object.assign(s, { theme: idea.theme, yearOn: idea.year, texts: [idea.name] });
    for (const [k, v] of Object.entries(idea.c)) s.c[k] = named(k === "back" ? BACKS : COLOURS, v);
    buildSteps();
  } else return;
  update();
});
$("steps").addEventListener("input", (ev) => {
  const s = st(), t = ev.target;
  if (t.dataset.ti) s.texts[Number(t.dataset.ti)] = t.value.replace(/\s+/g, " ").trimStart();
  else if (t.id === "year-input") { t.value = t.value.replace(/\D/g, ""); s.year = t.value; }
  else if (t.id === "year-on") s.yearOn = t.checked;
  else return;
  update();
});

function update() {
  const p = product, s = st();
  const yearOk = !s.yearOn || p.year === undefined || /^\d{4}$/.test(s.year);
  const list = names(s), y = p.year !== undefined && yearOk ? year(s) : "";
  const theme = p.theme ? THEMES.find((t) => t.key === s.theme) : null;
  for (const b of document.querySelectorAll("[data-product]")) b.setAttribute("aria-pressed", String(b.dataset.product === p.key));
  for (const b of document.querySelectorAll("[data-theme]")) b.setAttribute("aria-pressed", String(b.dataset.theme === s.theme));
  for (const b of document.querySelectorAll("[data-slot]")) {
    const sl = p.slots.find((x) => x.key === b.dataset.slot);
    b.setAttribute("aria-pressed", String((sl.backs ? BACKS : COLOURS)[b.dataset.ci] === s.c[sl.key]));
  }
  for (const el of document.querySelectorAll("[data-slot-name]")) el.textContent = s.c[el.dataset.slotName].name;
  if (theme) $("theme-name").textContent = theme.name;
  if ($("year-input")) $("year-input").disabled = !s.yearOn;

  $("ornament").innerHTML = svg(p, s);
  $("ornament").setAttribute("aria-label", `Preview: ${p.name.toLowerCase()}${list.length ? ` with ${list.join(", ")}` : ""}`);
  $("size-tag").textContent = p.size;
  $("hang-tag").textContent = p.hangs ? "Ribbon included" : "Stands on a shelf";
  $("price").textContent = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p.price);
  const colours = p.slots.map((sl) => `${sl.label}: ${s.c[sl.key].name}`).join(" · ");
  $("summary").textContent = `${theme ? `${theme.name} ` : ""}${p.name.toLowerCase()}${list.length ? ` with ${list.map((n) => `“${n}”`).join(", ")}` : ""}${y ? ` and ${y}` : ""}`;

  // what app.js sends to the cart
  $("f-names").value = list.join(", ");
  $("f-year").value = y;
  $("f-details").value = theme ? `Theme: ${theme.name} · ${colours}` : colours;
  const btn = $("add-xmas");
  const [productId = "", variantId = ""] = p.wix;
  btn.dataset.add = productId;
  btn.dataset.variant = variantId;
  btn.disabled = !productId || !yearOk;
  btn.textContent = !productId ? "Orders open soon" : yearOk ? "Add to cart" : "Type a 4-digit year";
}

buildSteps();
update();
// redraw once the fonts have loaded, so the preview measures the right letters
Promise.all([document.fonts?.load("700 40px 'Dancing Script'"), document.fonts?.load("800 40px 'Baloo 2'")]).then(update).catch(() => {});
