// Free Christmas printables: black line art on an A4 page that families print at home.
// Each page is an SVG built here, so a child's name can be written onto it before printing.

const W = 210, H = 297; // A4 in millimetres
const LINE = 'fill="none" stroke="#1b1424" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"';
const THIN = 'fill="none" stroke="#1b1424" stroke-width="0.6" stroke-linecap="round"';
const TITLE_FONT = "'Baloo 2', 'Nunito', sans-serif";
const BODY_FONT = "'Nunito', sans-serif";

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Outlined letters so children can colour the title in too.
const title = (text, y, size = 16) =>
  `<text x="${W / 2}" y="${y}" text-anchor="middle" font-family="${TITLE_FONT}" font-weight="800" font-size="${size}" fill="#fff" stroke="#1b1424" stroke-width="0.8" stroke-linejoin="round">${esc(text)}</text>`;
const text = (str, x, y, size = 5, anchor = "middle", weight = 700) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${BODY_FONT}" font-weight="${weight}" font-size="${size}" fill="#1b1424">${esc(str)}</text>`;
const footer = () => text("Free printable from Vortex Toys · Merry Christmas!", W / 2, H - 8, 3.2, "middle", 600);

function snowflake(x, y, r) {
  let d = "";
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3, cx = Math.cos(a), sx = Math.sin(a);
    const px = (k) => (x + cx * r * k).toFixed(1), py = (k) => (y + sx * r * k).toFixed(1);
    d += `M${x} ${y}L${px(1)} ${py(1)}`;
    const bx = x + cx * r * 0.6, by = y + sx * r * 0.6;
    for (const s of [-1, 1]) {
      const b = a + (s * Math.PI) / 4;
      d += `M${bx.toFixed(1)} ${by.toFixed(1)}l${(Math.cos(b) * r * 0.3).toFixed(1)} ${(Math.sin(b) * r * 0.3).toFixed(1)}`;
    }
  }
  return `<path d="${d}" ${LINE}/>`;
}
function star(x, y, r, inner = 0.45) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, k = i % 2 ? r * inner : r;
    pts.push(`${(x + Math.cos(a) * k).toFixed(1)},${(y + Math.sin(a) * k).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" ${LINE}/>`;
}
const leaf = 'M0 0C3 -2 5 -6 9 -6C8 -3 11 -2 13 -3C12 0 15 1 17 1C14 4 11 4 9 6C9 3 6 3 4 4C4 2 2 1 0 0z';
const holly = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="${leaf}" transform="rotate(-25)" ${LINE}/><path d="${leaf}" transform="scale(-1 1) rotate(-25)" ${LINE}/>
  <circle cx="-2.6" cy="1.5" r="2.6" ${LINE}/><circle cx="2.6" cy="1.5" r="2.6" ${LINE}/><circle cx="0" cy="-2.6" r="2.6" ${LINE}/></g>`;
const present = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" ${LINE}/>
  <path d="M${x + w / 2} ${y}V${y + h}M${x} ${y + h * 0.35}H${x + w}" ${LINE}/>
  <path d="M${x + w / 2} ${y}c-6 -7 -12 -2 -8 1zM${x + w / 2} ${y}c6 -7 12 -2 8 1z" ${LINE}/>`;
const writeLine = (x1, x2, y) => `<path d="M${x1} ${y}H${x2}" ${THIN} stroke-dasharray="1.6 1.6"/>`;

// ---- the printables -------------------------------------------------------------------------------
const PRINTABLES = [
  {
    key: "ornament",
    name: "Colour-in ornament",
    about: "A big bauble full of snowflakes, holly and stars, with your name across the middle.",
    draw(name) {
      const cx = W / 2, cy = 160, r = 78;
      return `${title("Colour my ornament", 30)}
        <rect x="${cx - 12}" y="${cy - r - 14}" width="24" height="14" rx="2" ${LINE}/>
        <circle cx="${cx}" cy="${cy - r - 20}" r="6" ${LINE}/>
        <circle cx="${cx}" cy="${cy}" r="${r}" ${LINE} stroke-width="1.6"/>
        <path d="M${cx - r} ${cy - 22}Q${cx} ${cy - 40} ${cx + r} ${cy - 22}M${cx - r} ${cy + 22}Q${cx} ${cy + 4} ${cx + r} ${cy + 22}" ${LINE}/>
        <path d="M${cx - r + 6} ${cy - 50}Q${cx} ${cy - 66} ${cx + r - 6} ${cy - 50}M${cx - r + 6} ${cy + 50}Q${cx} ${cy + 36} ${cx + r - 6} ${cy + 50}" ${LINE}/>
        ${snowflake(cx - 40, cy - 46, 9)}${snowflake(cx + 40, cy - 46, 9)}${star(cx, cy - 50, 9)}
        ${holly(cx - 38, cy + 46, 1.1)}${holly(cx + 38, cy + 46, 1.1)}${star(cx, cy + 50, 7)}
        <text x="${cx}" y="${cy + 8}" text-anchor="middle" font-family="'Dancing Script', cursive" font-weight="700" font-size="${name ? Math.min(28, 200 / Math.max(name.length, 4)).toFixed(1) : 22}" fill="#fff" stroke="#1b1424" stroke-width="0.8">${esc(name || "Merry Christmas")}</text>
        ${snowflake(30, 70, 7)}${snowflake(182, 78, 6)}${snowflake(24, 250, 6)}${snowflake(186, 252, 8)}${star(40, 118, 5)}${star(172, 120, 5)}
        ${text("Tip: colour it in, cut it out, and hang it on the tree with a ribbon!", W / 2, 268, 4.5)}
        ${footer()}`;
    },
  },
  {
    key: "tags",
    name: "Gift tags",
    about: "Eight To and From tags to cut out and tie on your presents.",
    draw(name) {
      const icons = [
        (x, y) => star(x, y, 7), (x, y) => snowflake(x, y, 7), (x, y) => holly(x, y, 0.8), (x, y) => present(x - 7, y - 4, 14, 11),
        (x, y) => snowflake(x, y, 7), (x, y) => star(x, y, 7), (x, y) => present(x - 7, y - 4, 14, 11), (x, y) => holly(x, y, 0.8),
      ];
      let out = title("Gift tags", 26);
      const tw = 84, th = 48, gx = 14, gy = 8, x0 = (W - tw * 2 - gx) / 2, y0 = 38;
      icons.forEach((icon, i) => {
        const x = x0 + (i % 2) * (tw + gx), y = y0 + Math.floor(i / 2) * (th + gy);
        out += `<path d="M${x + 12} ${y}H${x + tw}V${y + th}H${x + 12}L${x} ${y + th / 2}z" ${LINE} stroke-dasharray="2.5 1.5"/>
          <circle cx="${x + 9}" cy="${y + th / 2}" r="2.4" ${LINE}/>
          ${icon(x + tw - 13, y + 12)}
          ${text("To:", x + 18, y + 21, 5, "start", 800)}${writeLine(x + 28, x + tw - 26, y + 21)}
          ${text("From:", x + 18, y + 35, 5, "start", 800)}
          ${name ? text(name, x + 33, y + 34, 5, "start", 600) : ""}${writeLine(x + 32, x + tw - 8, y + 35)}`;
      });
      return out + text("Cut along the dashed lines and punch a hole for the ribbon.", W / 2, 268, 4.5) + footer();
    },
  },
  {
    key: "santa",
    name: "Letter to Santa",
    about: "Write your wish list, tell Santa how good you've been, and draw your dream toy.",
    draw(name) {
      let out = `${title("Dear Santa", 30, 18)}${holly(28, 22, 1)}${holly(182, 22, 1)}
        ${text("My name is", 22, 50, 5.5, "start", 800)}${name ? text(name, 58, 49, 6, "start", 700) : ""}${writeLine(54, 120, 50)}
        ${text("I am", 128, 50, 5.5, "start", 800)}${writeLine(141, 160, 50)}${text("years old", 162, 50, 5.5, "start", 800)}
        ${text("This year I have been...", 22, 64, 5.5, "start", 800)}`;
      ["Very good", "Mostly good", "Trying my best!"].forEach((t, i) => {
        const x = 26 + i * 58;
        out += `<rect x="${x}" y="69" width="6" height="6" rx="1" ${LINE}/>${text(t, x + 9, 74, 5, "start", 600)}`;
      });
      out += text("For Christmas I would love:", 22, 90, 5.5, "start", 800);
      for (let i = 0; i < 5; i++) out += `${star(26, 101 + i * 12, 3)}${writeLine(32, 188, 102 + i * 12)}`;
      out += `${text("Here is a drawing of my dream toy:", 22, 168, 5.5, "start", 800)}
        <rect x="22" y="174" width="166" height="74" rx="6" ${LINE}/>
        ${text("Love from", 120, 262, 5.5, "start", 800)}${writeLine(144, 188, 262)}
        ${present(28, 254, 14, 11)}${snowflake(60, 260, 6)}`;
      return out + footer();
    },
  },
  {
    key: "design",
    name: "Design your own ornament",
    about: "Draw your own ornaments inside the shapes. Send us a photo and we can 3D print one for you!",
    draw(name) {
      const shapes = [
        (x, y) => `<circle cx="${x}" cy="${y + 4}" r="30" ${LINE}/><rect x="${x - 6}" y="${y - 33}" width="12" height="7" rx="1" ${LINE}/>`,
        (x, y) => star(x, y + 2, 34, 0.5),
        (x, y) => `<path d="M${x} ${y - 30}C${x - 6} ${y - 30} ${x - 10} ${y - 24} ${x - 12} ${y - 14}C${x - 16} ${y + 6} ${x - 22} ${y + 18} ${x - 30} ${y + 26}H${x + 30}C${x + 22} ${y + 18} ${x + 16} ${y + 6} ${x + 12} ${y - 14}C${x + 10} ${y - 24} ${x + 6} ${y - 30} ${x} ${y - 30}z" ${LINE}/><circle cx="${x}" cy="${y + 31}" r="5" ${LINE}/>`,
        (x, y) => `<path d="M${x} ${y - 32}L${x - 18} ${y - 8}H${x - 9}L${x - 26} ${y + 14}H${x - 12}L${x - 32} ${y + 32}H${x + 32}L${x + 12} ${y + 14}H${x + 26}L${x + 9} ${y - 8}H${x + 18}z" ${LINE}/>`,
        (x, y) => `<path d="M${x - 14} ${y - 32}H${x + 10}V${y + 4}C${x + 10} ${y + 22} ${x - 2} ${y + 32} ${x - 18} ${y + 32}C${x - 30} ${y + 32} ${x - 34} ${y + 18} ${x - 26} ${y + 12}L${x - 14} ${y + 4}z" ${LINE}/><path d="M${x - 16} ${y - 32}H${x + 12}V${y - 22}H${x - 16}z" ${LINE}/>`,
        (x, y) => `<path d="M${x} ${y + 30}C${x - 40} ${y + 4} ${x - 36} ${y - 34} ${x} ${y - 16}C${x + 36} ${y - 34} ${x + 40} ${y + 4} ${x} ${y + 30}z" ${LINE}/>`,
      ];
      const labels = ["Bauble", "Star", "Bell", "Tree", "Stocking", "Heart"];
      let out = `${title(name ? `${name}'s ornament ideas` : "Design your own ornament", 28, name ? 14 : 16)}
        ${text("Draw a pattern, a picture or a name inside each shape. Colour them in!", W / 2, 40, 4.5, "middle", 600)}`;
      shapes.forEach((shape, i) => {
        const x = 55 + (i % 2) * 100, y = 78 + Math.floor(i / 2) * 74;
        out += `<g transform="translate(${x} ${y}) scale(.85) translate(${-x} ${-y})">${shape(x, y)}</g>` + text(labels[i], x, y + 38, 4.5, "middle", 800);
      });
      return out + text("Love your design? Send us a photo and we can 3D print it for you.", W / 2, 279, 4.5) + footer();
    },
  },
  {
    key: "tree",
    name: "Decorate the tree",
    about: "A Christmas tree waiting for you to draw baubles, lights and presents underneath.",
    draw(name) {
      const cx = W / 2;
      return `${title(name ? `${name}'s Christmas tree` : "Decorate the tree", 28, name ? 15 : 16)}
        ${star(cx, 52, 13)}
        <path d="M${cx} 64L${cx - 34} 108H${cx - 18}L${cx - 54} 156H${cx - 32}L${cx - 76} 212H${cx + 76}L${cx + 32} 156H${cx + 54}L${cx + 18} 108H${cx + 34}z" ${LINE} stroke-width="1.6"/>
        <rect x="${cx - 12}" y="212" width="24" height="20" ${LINE}/>
        <path d="M${cx - 26} 96Q${cx} 112 ${cx + 26} 96M${cx - 44} 142Q${cx} 162 ${cx + 44} 142M${cx - 64} 196Q${cx} 218 ${cx + 64} 196" ${THIN} stroke-dasharray="3 2"/>
        ${present(cx - 70, 222, 26, 20)}${present(cx + 40, 218, 30, 24)}
        ${snowflake(28, 70, 7)}${snowflake(182, 66, 8)}${snowflake(22, 160, 6)}${snowflake(190, 170, 6)}
        ${text("Draw baubles, lights and presents. How many stars can you add?", W / 2, 268, 4.5)}
        ${footer()}`;
    },
  },
  {
    key: "countdown",
    name: "Countdown to Christmas",
    about: "Colour one box every day from December 1st. When you reach 24, it's Christmas Eve!",
    draw() {
      const art = [(x, y) => star(x, y, 6), (x, y) => snowflake(x, y, 6), (x, y) => holly(x, y, 0.6), (x, y) => present(x - 6, y - 4, 12, 9)];
      let out = `${title("Countdown to Christmas", 28)}${text("Colour in one box every day in December.", W / 2, 40, 4.5, "middle", 600)}`;
      const cols = 6, bw = 28, bh = 50, gap = 4, x0 = (W - bw * cols - gap * (cols - 1)) / 2, y0 = 50;
      for (let i = 0; i < 24; i++) {
        const x = x0 + (i % cols) * (bw + gap), y = y0 + Math.floor(i / cols) * (bh + gap);
        out += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="4" ${LINE}/>
          <text x="${x + 4}" y="${y + 11}" font-family="${TITLE_FONT}" font-weight="800" font-size="9" fill="#fff" stroke="#1b1424" stroke-width="0.6">${i + 1}</text>
          ${art[i % 4](x + bw / 2, y + 32)}`;
      }
      return out + text("Ho ho ho! When every box is coloured, it's Christmas Eve!", W / 2, 268, 4.5) + footer();
    },
  },
];

// ---- page wiring --------------------------------------------------------------------------------
const svg = (p, name) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm"><rect width="${W}" height="${H}" fill="#fff"/>${p.draw(name)}</svg>`;

const grid = document.getElementById("printables");
const nameInput = document.getElementById("printable-name");
const currentName = () => (nameInput?.value ?? "").trim().slice(0, 14);

function render() {
  const name = currentName();
  grid.innerHTML = PRINTABLES.map((p) => `
    <article class="printable">
      <div class="printable-sheet">${svg(p, name).replace(/ width="210mm" height="297mm"/, "")}</div>
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.about)}</p>
      <div class="printable-actions">
        <button class="btn" type="button" data-print="${p.key}">Print</button>
        <button class="btn secondary" type="button" data-download="${p.key}">Download</button>
      </div>
    </article>`).join("");
}

function printPage(p) {
  const fonts = document.querySelector('link[href*="fonts.googleapis.com/css2"]')?.href ?? "";
  const win = window.open("", "_blank");
  if (!win) return alert("Please allow pop-ups to print this page.");
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(p.name)} · Vortex Toys</title>
    ${fonts ? `<link rel="stylesheet" href="${fonts}">` : ""}
    <style>@page { size: A4; margin: 0; } html, body { margin: 0; } svg { display: block; width: 210mm; height: 297mm; }</style>
    </head><body>${svg(p, currentName())}</body></html>`);
  win.document.close();
  // Wait for the fonts so the titles print in the right lettering.
  const go = () => { win.focus(); win.print(); };
  (win.document.fonts?.ready ?? Promise.resolve()).then(() => setTimeout(go, 150));
}

function download(p) {
  const name = currentName();
  const blob = new Blob([svg(p, name)], { type: "image/svg+xml" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `vortex-christmas-${p.key}${name ? `-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : ""}.svg`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

if (grid) {
  render();
  nameInput?.addEventListener("input", render);
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-print], [data-download]");
    if (!btn) return;
    const p = PRINTABLES.find((x) => x.key === (btn.dataset.print ?? btn.dataset.download));
    if (btn.dataset.print) printPage(p); else download(p);
  });
}
