// Design-your-own page: shape, size, colours and text, a live 3D preview, and the price.
// Adding to the cart is left to app.js: it reads the hidden inputs and the #add-design button.
// three.js comes from the CDN through the import map in design.html, loaded at the bottom so the
// controls and the cart button still work if it can't load.
import { PRODUCT_ID, VARIANTS, SHAPES, SIZES, COLOURS } from "./catalog.js";
import { getProject, createProject, updateProject } from "./projects.js";

let THREE, OrbitControls, FontLoader, TextGeometry;

const state = { shape: "star", size: "Medium", main: COLOURS[0], textColour: COLOURS[7], text: "" };

// a starting design passed in the link, e.g. from the idea helper on the Create your own page
const params = new URLSearchParams(location.search);
const colourNamed = (name) => COLOURS.find((c) => c.name === name);
if (SHAPES.some((s) => s.key === params.get("shape"))) state.shape = params.get("shape");
if (SIZES.some((s) => s.name === params.get("size"))) state.size = params.get("size");
state.main = colourNamed(params.get("main")) ?? state.main;
state.textColour = colourNamed(params.get("textc")) ?? state.textColour;
state.text = (params.get("text") ?? "").slice(0, 14);

// or a saved project (?project=id), which then keeps every change
let project = getProject(params.get("project"));
if (project) {
  const d = project.design;
  if (VARIANTS[d.shape]?.[d.size]) Object.assign(state, { shape: d.shape, size: d.size });
  state.main = colourNamed(d.main) ?? state.main;
  state.textColour = colourNamed(d.textc) ?? state.textColour;
  state.text = String(d.text ?? "").slice(0, 14);
}
const stored = () => ({ shape: state.shape, size: state.size, main: state.main.name, textc: state.textColour.name, text: state.text.trim() });

// ---- controls ---------------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

$("shape-choices").innerHTML = SHAPES.map((s) => `
  <button type="button" class="choice" data-shape="${s.key}" aria-pressed="false">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${s.icon}" fill-rule="evenodd"/></svg>${esc(s.name)}
  </button>`).join("");
$("size-choices").innerHTML = SIZES.map((s) => `
  <button type="button" class="choice" data-size="${s.name}" aria-pressed="false">${s.name}<small id="size-mm-${s.name}"></small></button>`).join("");
const swatches = (group) => COLOURS.map((c, i) => `
  <button type="button" class="swatch${c.glow ? " glow" : ""}" style="--c:${c.hex}" data-${group}="${i}" aria-pressed="false" aria-label="${esc(c.name)}" title="${esc(c.name)}"></button>`).join("");
$("main-swatches").innerHTML = swatches("main");
$("text-swatches").innerHTML = swatches("textc");

document.querySelector(".designer-panel").addEventListener("click", (ev) => {
  const b = ev.target.closest("button");
  if (!b) return;
  if (b.dataset.shape) state.shape = b.dataset.shape;
  else if (b.dataset.size) state.size = b.dataset.size;
  else if (b.dataset.main) state.main = COLOURS[Number(b.dataset.main)];
  else if (b.dataset.textc) state.textColour = COLOURS[Number(b.dataset.textc)];
  else return;
  update(b.dataset.shape || b.dataset.size ? "model" : "colour");
});
$("text-input").value = state.text;
$("save-project").addEventListener("click", () => {
  const name = state.text.trim() ? `${shapeOf().name} “${state.text.trim()}”` : `${state.main.name} ${shapeOf().name.toLowerCase()}`;
  project = createProject({ name, design: stored() });
  if (project) history.replaceState(null, "", `design.html?project=${project.id}`);
  renderProject(project ? "" : "This browser can't save projects.");
});
function renderProject(problem = "") {
  $("save-project").hidden = !!project;
  $("project-status").innerHTML = problem ? esc(problem)
    : project ? `Project: <b>${esc(project.name)}</b> · changes are saved · <a href="create.html#my-projects">My projects</a>`
    : "Want to come back to this later?";
}
$("text-input").addEventListener("input", (ev) => {
  state.text = ev.target.value.replace(/\s+/g, " ").trimStart();
  update("text");
});

const shapeOf = () => SHAPES.find((s) => s.key === state.shape);
const sizeOf = () => SIZES.find((s) => s.name === state.size);
const money = (n) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
function printTime(h) {
  const mins = Math.round((h * 60) / 5) * 5;
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h${mins % 60 ? ` ${mins % 60} min` : ""}`;
}

function renderControls() {
  const shape = shapeOf(), size = sizeOf(), text = state.text.trim();
  for (const b of document.querySelectorAll("[data-shape]")) b.setAttribute("aria-pressed", String(b.dataset.shape === state.shape));
  for (const b of document.querySelectorAll("[data-size]")) b.setAttribute("aria-pressed", String(b.dataset.size === state.size));
  for (const b of document.querySelectorAll("[data-main]")) b.setAttribute("aria-pressed", String(COLOURS[b.dataset.main] === state.main));
  for (const b of document.querySelectorAll("[data-textc]")) b.setAttribute("aria-pressed", String(COLOURS[b.dataset.textc] === state.textColour));
  $("main-name").textContent = state.main.name;
  $("text-name").textContent = state.textColour.name;
  $("text-colour").hidden = !text;

  const base = MODELS[state.shape];
  for (const s of SIZES) $(`size-mm-${s.name}`).textContent = `${Math.round(base.w * s.scale)} mm`;
  $("dims").textContent = `About ${Math.round(base.w * size.scale)} × ${Math.round(base.h * size.scale)} mm`;
  $("facts").textContent = `${Math.round(shape.grams * size.grams)} g of plastic · prints in ${printTime(shape.hours * size.hours)}`;

  const [variantId, price] = VARIANTS[state.shape][state.size];
  $("price").textContent = money(price);
  $("summary").textContent = `${size.name} ${shape.name.toLowerCase()} in ${state.main.name}` +
    (text ? ` with “${text}” in ${state.textColour.name}` : "");

  // what app.js sends to the cart
  $("f-main").value = state.main.name;
  $("f-text").value = text;
  $("f-text-colour").value = text ? state.textColour.name : "";
  $("add-design").dataset.add = PRODUCT_ID;
  $("add-design").dataset.variant = variantId;
}

// ---- shapes (millimetres, Medium size, lying flat in x/y) -------------------------------------
function roundedRect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
const hole = (x, y, r) => new THREE.Path().absarc(x, y, r, 0, Math.PI * 2, true);

function star() {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 13 : 30, a = Math.PI / 2 + (i * Math.PI) / 5;
    const x = Math.cos(a) * r, y = Math.sin(a) * r - 2;
    i ? s.lineTo(x, y) : s.moveTo(x, y);
  }
  return s;
}
function heart() {
  // the three.js heart, flipped so the point is at the bottom, then scaled and centred
  const k = 0.55, p = (x, y) => [(x - 25) * k, (47.5 - y) * k];
  const s = new THREE.Shape();
  s.moveTo(...p(25, 25));
  s.bezierCurveTo(...p(25, 25), ...p(20, 0), ...p(0, 0));
  s.bezierCurveTo(...p(-30, 0), ...p(-30, 35), ...p(-30, 35));
  s.bezierCurveTo(...p(-30, 55), ...p(-10, 77), ...p(25, 95));
  s.bezierCurveTo(...p(60, 77), ...p(80, 55), ...p(80, 35));
  s.bezierCurveTo(...p(80, 35), ...p(80, 0), ...p(50, 0));
  s.bezierCurveTo(...p(35, 0), ...p(25, 25), ...p(25, 25));
  return s;
}
function spinner() {
  // outline of a centre disc plus three lobes, traced around the middle
  const lobes = [90, 210, 330].map((d) => (d * Math.PI) / 180);
  const s = new THREE.Shape();
  for (let i = 0; i <= 180; i++) {
    const t = (i / 180) * Math.PI * 2;
    let r = 14;
    for (const a of lobes) {
      const along = 20 * Math.cos(t - a), off2 = 400 - along * along;
      if (off2 < 121) r = Math.max(r, along + Math.sqrt(121 - off2));
    }
    i ? s.lineTo(Math.cos(t) * r, Math.sin(t) * r) : s.moveTo(Math.cos(t) * r, Math.sin(t) * r);
  }
  for (const a of lobes) s.holes.push(hole(Math.cos(a) * 20, Math.sin(a) * 20, 6.5));
  return s;
}

// w/h: footprint in mm; depth: thickness; text: the box the words are fitted into
const MODELS = {
  tag: { w: 52, h: 22, depth: 4, text: { x: 4, y: 0, w: 34, h: 12 },
    make() { const s = roundedRect(52, 22, 8); s.holes.push(hole(-19, 0, 3.5)); return s; } },
  star: { w: 57, h: 54, depth: 6, text: { x: 0, y: -1, w: 22, h: 8 }, make: star },
  heart: { w: 61, h: 52, depth: 5, text: { x: 0, y: 4, w: 32, h: 11 }, make: heart },
  spinner: { w: 60, h: 56, depth: 7, text: { x: 0, y: 0, w: 19, h: 7 }, make: spinner },
  plate: { w: 92, h: 28, depth: 5, text: { x: 0, y: 0, w: 82, h: 17 }, make: () => roundedRect(92, 28, 6) },
};
const BEVEL = 0.8;

// ---- 3D preview -------------------------------------------------------------------------------
const canvas = $("preview");
let three = null, font = null;

function initThree() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 1, 2000);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3b1a6b, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(60, 140, 90);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x00e5ff, 1.4);
  rim.position.set(-120, 60, -100);
  scene.add(rim);

  // printer bed
  const bed = new THREE.Mesh(new THREE.CylinderGeometry(120, 120, 2, 64), new THREE.MeshStandardMaterial({ color: 0x1a1230, roughness: 0.9 }));
  bed.position.y = -1;
  scene.add(bed);
  const grid = new THREE.PolarGridHelper(118, 8, 6, 64, 0x9b5cff, 0x3a2a63);
  grid.position.y = 0.05;
  scene.add(grid);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  controls.autoRotateSpeed = 2.5;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.addEventListener("start", () => { controls.autoRotate = false; });

  const model = new THREE.Group();
  model.rotation.x = -Math.PI / 2; // shapes are drawn in x/y; lay them flat on the bed
  scene.add(model);
  const body = new THREE.Mesh(undefined, new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.05 }));
  const words = new THREE.Mesh(undefined, new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.05 }));
  model.add(body, words);

  three = { renderer, scene, camera, controls, model, body, words };
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();
  renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
}

function setMaterial(mat, colour) {
  mat.color.set(colour.hex);
  mat.emissive.set(colour.glow ? 0x3cff6e : 0x000000);
  mat.emissiveIntensity = colour.glow ? 0.35 : 0;
}

function buildBody() {
  const m = MODELS[state.shape];
  three.body.geometry?.dispose();
  three.body.geometry = new THREE.ExtrudeGeometry(m.make(), {
    depth: m.depth, curveSegments: 24, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL, bevelSegments: 3,
  });
  // sit on the bed: the bevel reaches BEVEL below z = 0
  three.body.position.z = BEVEL;
  // frame the Large version, so changing the size visibly changes the model
  const r = Math.hypot(m.w, m.h) * 0.5 * SIZES[2].scale;
  const dist = (r / Math.sin(THREE.MathUtils.degToRad(three.camera.fov / 2))) * 1.05;
  three.camera.position.set(0, dist * 0.72, dist * 0.7);
  three.controls.target.set(0, 0, 0);
  three.controls.minDistance = dist * 0.5;
  three.controls.maxDistance = dist * 1.6;
}

function buildText() {
  const m = MODELS[state.shape], text = state.text.trim();
  three.words.geometry?.dispose();
  three.words.geometry = new THREE.BufferGeometry();
  three.words.visible = false;
  const missing = font && [...text].some((ch) => ch !== " " && !font.data.glyphs[ch]);
  $("text-hint").textContent = missing
    ? "Some of these letters don't show in the preview, but they will still be printed."
    : "Up to 14 letters. Leave it empty for a plain print.";
  if (!font || !text) return;
  const g = new TextGeometry(text, { font, size: 10, depth: 1.6, curveSegments: 8, bevelEnabled: false });
  g.computeBoundingBox();
  const b = g.boundingBox, bw = b.max.x - b.min.x, bh = b.max.y - b.min.y;
  if (!bw || !bh) { g.dispose(); return; }
  g.translate(-(b.min.x + bw / 2), -(b.min.y + bh / 2), 0);
  const k = Math.min(m.text.w / bw, m.text.h / bh);
  three.words.geometry = g;
  three.words.scale.set(k, k, 1);
  three.words.position.set(m.text.x, m.text.y, BEVEL * 2 + m.depth - 0.3);
  three.words.visible = true;
}

function renderModel(what) {
  if (!three) return;
  if (what === "model" || what === "all") buildBody();
  if (what === "model" || what === "text" || what === "all") buildText();
  three.model.scale.setScalar(sizeOf().scale);
  setMaterial(three.body.material, state.main);
  setMaterial(three.words.material, state.textColour);
}

function update(what) {
  renderControls();
  renderModel(what);
  if (project && what !== "all") project = updateProject(project.id, { design: stored() }) ?? project;
}

update("all");
renderProject();
try {
  const [t, oc, fl, tg] = await Promise.all([
    import("three"),
    import("three/addons/controls/OrbitControls.js"),
    import("three/addons/loaders/FontLoader.js"),
    import("three/addons/geometries/TextGeometry.js"),
  ]);
  [THREE, { OrbitControls }, { FontLoader }, { TextGeometry }] = [t, oc, fl, tg];
  initThree();
} catch {
  three = null;
}
if (three) {
  $("stage-msg").hidden = true;
  renderModel("all");
  new FontLoader().load("https://cdn.jsdelivr.net/npm/three@0.170.0/examples/fonts/helvetiker_bold.typeface.json", (f) => { font = f; renderModel("text"); });
} else {
  $("stage-msg").textContent = "The 3D preview can't run on this device, but you can still design your print and order it.";
}
