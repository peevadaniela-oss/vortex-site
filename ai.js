// AI model maker: a visitor describes an idea, the AI server (a Cloudflare Worker, see
// vortex-ai-server/worker.js) has Meshy make a brand-new 3D model, and the visitor sees it in 3D,
// picks a size and colour, and buys it. Adding to the cart is left to app.js (the .card button).
import { COLOURS } from "./catalog.js";

// The Worker's address, e.g. "https://vortex-ai.yourname.workers.dev". Empty until it's set up.
const AI_SERVER = "";

// the "Custom AI 3D Print" product in Wix; prices must match the Wix variants
const PRODUCT_ID = "b112e32a-f2c2-4051-a3c4-f3940e8c36d8";
const SIZES = [
  { name: "Small", mm: 40, variant: "d9e6c7ec-9b4e-4cdb-8d6a-738b940058df", price: 15 },
  { name: "Medium", mm: 60, variant: "5c2af9a0-c98c-4506-9b5d-b317a220993e", price: 19 },
  { name: "Large", mm: 90, variant: "ba2ddecb-09fc-483f-a204-335e70a0f852", price: 28 },
];
const JOB_KEY = "vortex-ai-job";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const state = { size: "Medium", colour: COLOURS[0], job: null, ready: false };
const sizeOf = () => SIZES.find((s) => s.name === state.size);

function loadJob() {
  try { return JSON.parse(localStorage.getItem(JOB_KEY) || "null"); } catch { return null; }
}
function saveJob(job) {
  try { job ? localStorage.setItem(JOB_KEY, JSON.stringify(job)) : localStorage.removeItem(JOB_KEY); } catch { /* no storage */ }
}

// ---- controls ---------------------------------------------------------------------------------
$("ai-sizes").innerHTML = SIZES.map((s) => `
  <button type="button" class="choice" data-ai-size="${s.name}" aria-pressed="false">${s.name}<small>${s.mm} mm · ${money(s.price)}</small></button>`).join("");
$("ai-swatches").innerHTML = COLOURS.map((c, i) => `
  <button type="button" class="swatch${c.glow ? " glow" : ""}" style="--c:${c.hex}" data-ai-colour="${i}" aria-pressed="false" aria-label="${esc(c.name)}" title="${esc(c.name)}"></button>`).join("");

function setMessage(text, kind = "") {
  $("ai-msg").textContent = text;
  $("ai-msg").className = `ai-msg ${kind}`;
}
function setProgress(pct) {
  $("ai-progress").hidden = pct == null;
  $("ai-progress-bar").style.width = `${pct ?? 0}%`;
}

function render() {
  for (const b of document.querySelectorAll("[data-ai-size]")) b.setAttribute("aria-pressed", String(b.dataset.aiSize === state.size));
  for (const b of document.querySelectorAll("[data-ai-colour]")) b.setAttribute("aria-pressed", String(COLOURS[b.dataset.aiColour] === state.colour));
  $("ai-colour-name").textContent = state.colour.name;
  $("ai-price").textContent = money(sizeOf().price);
  $("ai-buy").hidden = !state.ready;
  $("ai-reset").hidden = !state.job;
  // what app.js sends to the cart
  $("ai-f-idea").value = state.job?.idea ?? "";
  $("ai-f-colour").value = state.colour.name;
  $("ai-f-model").value = state.job?.id ?? "";
  $("ai-add").dataset.add = state.ready ? PRODUCT_ID : "";
  $("ai-add").dataset.variant = sizeOf().variant;
  if (viewer) viewer.restyle();
}

document.querySelector(".ai-maker").addEventListener("click", (ev) => {
  const b = ev.target.closest("button");
  if (!b) return;
  if (b.dataset.aiSize) state.size = b.dataset.aiSize;
  else if (b.dataset.aiColour) state.colour = COLOURS[Number(b.dataset.aiColour)];
  else if (b.classList.contains("ai-chip")) { $("ai-idea").value = b.textContent; return; }
  else return;
  render();
});

// ---- talking to the AI server -----------------------------------------------------------------
async function api(path, init) {
  const res = await fetch(AI_SERVER + path, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "The AI isn't answering right now. Please try again later.");
  return data;
}

async function generate() {
  const idea = $("ai-idea").value.replace(/\s+/g, " ").trim();
  if (idea.length < 3) { setMessage("Tell the AI what to make first.", "error"); return; }
  $("ai-go").disabled = true;
  setMessage("Sending your idea to the AI…");
  try {
    const { id } = await api("/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: idea }) });
    state.job = { id, idea };
    state.ready = false;
    saveJob(state.job);
    viewer?.clear();
    render();
    await follow();
  } catch (e) {
    setMessage(e.message, "error");
    setProgress(null);
  }
  $("ai-go").disabled = false;
}

// check on the model until it's done, then show it
async function follow() {
  const job = state.job;
  $("ai-stage-msg").hidden = false;
  $("ai-stage-msg").textContent = "Your model is being made…";
  for (;;) {
    if (state.job !== job) return; // started over
    let t;
    try { t = await api(`/status/${job.id}`); } catch (e) { setMessage(e.message, "error"); setProgress(null); return; }
    if (t.status === "SUCCEEDED") break;
    if (t.status === "FAILED" || t.status === "CANCELED") {
      setMessage("The AI couldn't make that one. Try describing it a little differently.", "error");
      setProgress(null);
      $("ai-stage-msg").textContent = "No model this time.";
      state.job = null;
      saveJob(null);
      render();
      return;
    }
    setProgress(t.progress || 2);
    setMessage(t.status === "PENDING" ? "Waiting for a free spot at the AI…" : `Making your model… ${t.progress || 0}%. This takes about a minute.`);
    await sleep(4000);
  }
  setProgress(100);
  setMessage("Loading your model…");
  try {
    await showModel(job.id);
    state.ready = true;
    setProgress(null);
    setMessage("Here it is! Drag to spin it around, then pick a size and colour.", "ok");
  } catch {
    setMessage("Your model is ready, but it couldn't be shown on this device.", "error");
  }
  render();
}

// ---- 3D preview -------------------------------------------------------------------------------
let viewer = null;
async function showModel(id) {
  viewer ??= await makeViewer();
  await viewer.load(`${AI_SERVER}/model/${id}`);
  $("ai-stage-msg").hidden = true;
}

async function makeViewer() {
  const [THREE, { OrbitControls }, { GLTFLoader }] = await Promise.all([
    import("three"), import("three/addons/controls/OrbitControls.js"), import("three/addons/loaders/GLTFLoader.js"),
  ]);
  const canvas = $("ai-preview");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 1, 3000);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3b1a6b, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(60, 160, 90);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x00e5ff, 1.4);
  rim.position.set(-120, 60, -100);
  scene.add(rim);
  const bed = new THREE.Mesh(new THREE.CylinderGeometry(110, 110, 2, 64), new THREE.MeshStandardMaterial({ color: 0x1a1230, roughness: 0.9 }));
  bed.position.y = -1;
  const grid = new THREE.PolarGridHelper(108, 8, 6, 64, 0x9b5cff, 0x3a2a63);
  grid.position.y = 0.05;
  scene.add(bed, grid);

  // frame the Large size, so changing the size visibly changes the model
  camera.position.set(0, 95, 150);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 30, 0);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 70;
  controls.maxDistance = 320;
  controls.autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  controls.autoRotateSpeed = 2.5;
  controls.addEventListener("start", () => { controls.autoRotate = false; });

  const material = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.05 });
  const holder = new THREE.Group();
  scene.add(holder);
  let model = null, unit = 1;

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

  return {
    async load(url) {
      const gltf = await new GLTFLoader().loadAsync(url);
      this.clear();
      model = gltf.scene;
      // printed in one colour, so the AI's own colours are replaced by the filament colour
      model.traverse((o) => { if (o.isMesh) { o.material = material; o.castShadow = false; } });
      const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), centre = box.getCenter(new THREE.Vector3());
      model.position.set(-centre.x, -box.min.y, -centre.z); // stand it on the bed
      unit = 1 / Math.max(size.x, size.y, size.z, 1e-6);
      holder.add(model);
      this.restyle();
    },
    clear() {
      if (!model) return;
      holder.remove(model);
      model.traverse((o) => o.geometry?.dispose());
      model = null;
    },
    restyle() {
      material.color.set(state.colour.hex);
      material.emissive.set(state.colour.glow ? 0x3cff6e : 0x000000);
      material.emissiveIntensity = state.colour.glow ? 0.35 : 0;
      holder.scale.setScalar(unit * sizeOf().mm); // the longest side is the size in mm
    },
  };
}

// ---- start ------------------------------------------------------------------------------------
$("ai-go").addEventListener("click", generate);
$("ai-reset").addEventListener("click", () => {
  state.job = null;
  state.ready = false;
  saveJob(null);
  viewer?.clear();
  setMessage("");
  setProgress(null);
  $("ai-stage-msg").hidden = false;
  $("ai-stage-msg").textContent = "Your model will appear here.";
  render();
});

render();
if (!AI_SERVER) {
  $("ai-go").disabled = true;
  setMessage("The AI model maker is almost ready. Check back soon!");
} else {
  state.job = loadJob();
  render();
  if (state.job) follow();
}
