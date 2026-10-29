// Create-your-own page: the price table, and the design assistant that turns a description into
// a saved project people can open and keep editing in the designer.
import { VARIANTS, SHAPES, SIZES, COLOURS } from "./catalog.js";
import { listProjects, createProject, updateProject, deleteProject } from "./projects.js";

// When an AI service is set up, put its address here. It gets { idea } and answers with
// { shape, size, main, textc, text, why: [] }; until then (or if it fails) the built-in helper runs.
const AI_ENDPOINT = "";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const designLink = (d) => `design.html?${new URLSearchParams({ shape: d.shape, size: d.size, main: d.main.name, textc: d.textColour.name, text: d.text })}`;
const shapeName = (key) => SHAPES.find((s) => s.key === key).name;

// ---- price table ------------------------------------------------------------------------------
$("price-table").innerHTML = `
  <thead><tr><th>Shape</th>${SIZES.map((s) => `<th>${s.name}</th>`).join("")}</tr></thead>
  <tbody>${SHAPES.map((sh) => `
    <tr><th scope="row">${esc(sh.name)}</th>${SIZES.map((s) => `
      <td><a href="design.html?shape=${sh.key}&size=${s.name}">${money(VARIANTS[sh.key][s.name][1])}</a></td>`).join("")}</tr>`).join("")}
  </tbody>`;

// ---- the four photo shapes: dragons, letters and organizers --------------------------------------
const STARTERS = SHAPES.filter((s) => s.photo);
$("starter-grid").innerHTML = STARTERS.map((s) => `
  <a class="starter" id="starter-${s.key}" href="design.html?shape=${s.key}">
    <img src="${esc(s.photo)}" alt="${esc(s.credit ? `${s.name} by ${s.credit.by}` : `A ${s.name.toLowerCase()} we printed`)}" loading="lazy">
    <h3>${esc(s.name)}</h3>
    <span class="note">From ${money(VARIANTS[s.key].Small[1])}</span>
  </a>`).join("");
$("starter-credits").innerHTML = STARTERS.filter((s) => s.credit).map((s) => `The ${esc(s.name.toLowerCase())} is
  <a href="${esc(s.credit.model)}" target="_blank" rel="noopener">designed by ${esc(s.credit.by)}</a>
  (<a href="${esc(s.credit.profile)}" target="_blank" rel="noopener">profile</a>), shared under ${esc(s.credit.licence)}; the designer gives us the right to sell prints of it.`).join(" ");

// ---- built-in helper ------------------------------------------------------------------------------
// Reads the words people use for shapes, sizes and colours, and a name or short word to print.
const SHAPE_WORDS = [
  ["organizer", /\b(organi[sz]ers?|pencils?|pens?|stationery|pen ?holder|pencil ?pot)\b/],
  ["spike", /\b(spik(e|y|es)|serpents?|snakes?|articulated|flexi)\b/],
  ["egg", /\b(dragons?|eggs?|dino(saur)?s?)\b/],
  ["letter", /\b(letters?|initials?|monogram|alphabet)\b/],
  ["spinner", /\b(fidget|spinner|spin|spinny)\b/],
  ["plate", /\b(name ?plate|plaque|sign|door|desk|plate|shelf)\b/],
  ["tag", /\b(key ?chain|key ?ring|keys?|tag|bag|backpack|zipper)\b/],
  ["heart", /\b(hearts?|love|valentine|mum|mom|mommy|mummy|grandma|nana)\b/],
  ["star", /\b(stars?|space|galaxy|super ?star|night)\b/],
];
const SIZE_WORDS = [["Small", /\b(small|tiny|mini|little)\b/], ["Large", /\b(big|large|huge|giant|massive)\b/]];
const COLOUR_WORDS = [
  ["Glow in the dark", /\bglow(s|ing)?\b(\s+in\s+the\s+dark)?/],
  ["Galaxy purple", /\b(purple|violet|lilac|lavender)\b/],
  ["Neon green", /\b(green|lime)\b/],
  ["Sky blue", /\b(blue|turquoise|teal)\b/],
  ["Sunny yellow", /\b(yellow|gold|golden)\b/],
  ["Hot pink", /\b(pink|magenta)\b/],
  ["Fire orange", /\b(orange|red)\b/],
  ["Silver", /\b(silver|gr[ae]y)\b/],
  ["Snow white", /\bwhite\b/],
  ["Midnight black", /\bblack\b/],
];
const colour = (name) => COLOURS.find((c) => c.name === name);
const DARK = new Set(["Galaxy purple", "Midnight black", "Sky blue", "Fire orange", "Hot pink"]);

function findText(idea) {
  const quoted = idea.match(/["“]([^"”]{1,30})["”]/u);
  if (quoted) return { text: quoted[1].trim(), why: `It prints “${quoted[1].trim()}” because you put it in quotes.` };
  const said = idea.match(/\b(?:says?|saying|reads?|with the (?:name|word)|named|called|spells?)\s+([\p{L}\p{N}][\p{L}\p{N}'!-]*(?:\s+[\p{Lu}\p{N}][\p{L}\p{N}'!-]*)?)/u);
  if (said) return { text: said[1], why: `It prints “${said[1]}” from where you said what it should say.` };
  const forName = idea.match(/\bfor\s+(?:my\s+(?:little\s+|big\s+)?\p{L}+\s+)?(\p{Lu}[\p{L}'-]+)/u);
  if (forName) {
    const name = forName[1].replace(/['’]s$/u, "");
    return { text: name, why: `It prints “${name}”, the name of who it's for.` };
  }
  return { text: "", why: "There's no name on it yet. You can add one in the designer." };
}

function ideaToDesign(idea) {
  const lower = idea.toLowerCase(), why = [];
  const { text: rawText, why: textWhy } = findText(idea);
  const text = rawText.slice(0, 14);

  const shapeHit = SHAPE_WORDS.find(([, re]) => re.test(lower));
  const shape = shapeHit ? shapeHit[0] : text.length > 8 ? "plate" : "star";
  const label = shapeName(shape).toLowerCase();
  why.push(shapeHit ? `A ${label}, because you said “${lower.match(shapeHit[1])[0]}”.`
    : `A ${label} to start with. You can pick another shape in the designer.`);

  const sizeHit = SIZE_WORDS.find(([, re]) => re.test(lower));
  const size = sizeHit ? sizeHit[0] : "Medium";
  if (sizeHit) why.push(`${size}, because you said “${lower.match(sizeHit[1])[0]}”.`);

  // colours in the order they appear: the first is the main colour, the second the text colour
  const hits = COLOUR_WORDS.map(([name, re]) => ({ name, at: lower.search(re) })).filter((h) => h.at >= 0).sort((a, b) => a.at - b.at);
  const main = colour(hits[0]?.name ?? "Galaxy purple");
  const textColour = colour(hits[1]?.name ?? (DARK.has(main.name) ? "Snow white" : "Midnight black"));
  why.push(hits[0] ? `${main.name} for the main colour.` : `${main.name} for the main colour, our favourite.`);
  if (/\bred\b/.test(lower)) why.push("We don't have red yet, so it uses Fire orange, the closest colour.");
  if (text) {
    why.push(textWhy);
    if (rawText.length > 14) why.push("Names can be up to 14 letters, so it was shortened.");
  } else {
    why.push(textWhy);
  }
  return { shape, size, main, textColour, text, why };
}

// a real print of that shape, for the shapes we have photos of
function photoOf(key) {
  const sh = SHAPES.find((s) => s.key === key);
  return sh.photo ? `<img class="idea-photo" src="${esc(sh.photo)}" alt="A real ${esc(sh.name.toLowerCase())} we printed" loading="lazy">` : "";
}

function previewSvg(d) {
  const sh = SHAPES.find((s) => s.key === d.shape);
  const words = d.text ? `<text x="12" y="12.6" text-anchor="middle" dominant-baseline="middle" font-family="Baloo 2, sans-serif" font-weight="800"
    font-size="${Math.min(4, 26 / Math.max(d.text.length, 1))}" fill="${d.textColour.hex}">${esc(d.text)}</text>` : "";
  return `<svg viewBox="0 0 24 24" role="img" aria-label="Preview of your design">
    <path d="${sh.icon}" fill-rule="evenodd" fill="${d.main.hex}" stroke="rgba(0,0,0,.35)" stroke-width=".3"/>${words}</svg>`;
}

// stored projects keep colours by name; the page works with the colour objects
const toStored = (d) => ({ shape: d.shape, size: d.size, main: d.main.name, textc: d.textColour.name, text: d.text });
const fromStored = (s) => ({ ...s, main: colour(s.main) ?? COLOURS[0], textColour: colour(s.textc) ?? COLOURS[7] });
const projectName = (d) => d.text ? `${shapeName(d.shape)} “${d.text}”` : `${d.main.name} ${shapeName(d.shape).toLowerCase()}`;

async function interpret(idea) {
  if (AI_ENDPOINT) {
    try {
      const res = await fetch(AI_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idea }) });
      const a = await res.json();
      if (res.ok && VARIANTS[a.shape]?.[a.size] && colour(a.main)) {
        return { ...fromStored({ ...a, textc: colour(a.textc) ? a.textc : "Snow white", text: String(a.text ?? "").slice(0, 14) }), why: Array.isArray(a.why) ? a.why.map(String) : [] };
      }
    } catch { /* fall back to the built-in helper */ }
  }
  return ideaToDesign(idea);
}

function showDesign(d, project) {
  $("idea-result").innerHTML = `
    <div class="idea-card">
      ${previewSvg(d)}
      ${photoOf(d.shape)}
      <div>
        <span class="sub">${project ? "New project" : "Your starting design"}</span>
        <h3>${esc(project ? project.name : `${d.size} ${shapeName(d.shape).toLowerCase()}`)}</h3>
        <p class="note">${esc(d.size)} ${esc(shapeName(d.shape).toLowerCase())} in ${esc(d.main.name)}${d.text ? `, with “${esc(d.text)}” in ${esc(d.textColour.name)}` : ""}</p>
        <div class="big-price">${money(VARIANTS[d.shape][d.size][1])}</div>
      </div>
    </div>
    <ul class="idea-why">${d.why.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>
    ${project ? `<p class="idea-saved">Saved to My projects.</p>` : `<p class="note">This browser can't save projects, but you can still open the design.</p>`}
    <a class="btn" href="${esc(project ? `design.html?project=${project.id}` : designLink(d))}">Open it in the designer</a>`;
}

function renderProjects() {
  const list = listProjects();
  $("my-projects").hidden = !list.length;
  $("projects").innerHTML = list.map((p) => {
    const d = fromStored(p.design);
    return `
      <article class="project">
        ${previewSvg(d)}
        <h3>${esc(p.name)}</h3>
        <p class="note">${esc(d.size)} ${esc(shapeName(d.shape).toLowerCase())} · ${money(VARIANTS[d.shape][d.size][1])}</p>
        <div class="actions">
          <a class="btn" href="design.html?project=${esc(p.id)}">Edit</a>
          <button type="button" class="link-btn" data-rename="${esc(p.id)}">Rename</button>
          <button type="button" class="link-btn" data-delete="${esc(p.id)}">Delete</button>
        </div>
      </article>`;
  }).join("");
}
$("projects").addEventListener("click", (ev) => {
  const b = ev.target.closest("button");
  if (!b) return;
  if (b.dataset.rename) {
    const p = listProjects().find((x) => x.id === b.dataset.rename);
    const name = prompt("New name for this project:", p?.name ?? "")?.trim();
    if (name) updateProject(b.dataset.rename, { name: name.slice(0, 40) });
  }
  if (b.dataset.delete && confirm("Delete this project?")) deleteProject(b.dataset.delete);
  renderProjects();
});

async function run() {
  const idea = $("idea-text").value.trim();
  if (!idea) {
    $("idea-result").innerHTML = `<p class="idea-empty">Type your idea first, or try one of the examples.</p>`;
    return;
  }
  const go = $("idea-go");
  go.disabled = true;
  go.textContent = "Thinking…";
  const d = await interpret(idea);
  const project = createProject({ name: projectName(d), idea, design: toStored(d) });
  showDesign(d, project);
  renderProjects();
  go.disabled = false;
  go.textContent = "Make it a project";
}
$("idea-go").addEventListener("click", run);
$("idea-text").addEventListener("keydown", (ev) => {
  if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); run(); }
});
for (const chip of document.querySelectorAll("#idea .chip")) {
  chip.addEventListener("click", () => { $("idea-text").value = chip.textContent; run(); });
}
renderProjects();
