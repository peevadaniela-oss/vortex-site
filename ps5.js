// PS5 holders page: 20 controller holders and console stands, printed to order.
// Every design here is someone else's, shared under a licence that lets us sell prints
// (CC0, CC BY or CC BY-SA). CC BY and CC BY-SA ask us to name the designer and link the model
// wherever we sell it, so each card shows that, and credits.html lists them all too.
// Remixes also credit the design they were remixed from (`from`).
//
// ---- catalog: each item is its own Wix product (wix = [product id, variant id]) ----------------
// Leave wix empty until the product exists in Wix; the button then says orders open soon.
// Each Wix product needs a free-text field called "Colour". If a price changes in the Wix
// dashboard, change it here too (the cart always charges the Wix price).

const MW = "https://makerworld.com/en/models/";
const MWU = "https://makerworld.com/en/@";
const MWIMG = "https://makerworld.bblmw.com/makerworld/model/";
const TV = "https://www.thingiverse.com/thing:";
const TVU = "https://www.thingiverse.com/";
const TVIMG = "https://cdn.thingiverse.com/assets/";

export const LICENCES = {
  CC0: { name: "CC0 (public domain)", url: "https://creativecommons.org/publicdomain/zero/1.0/" },
  BY: { name: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" },
  "BY-SA": { name: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" },
};

// kind: "controller" (controller holders and mounts) or "console" (stands and wall mounts for the PS5)
export const PS5_ITEMS = [
  { key: "invisible-minimal", name: "Invisible controller holder", kind: "controller", price: 8, wix: [], top: true,
    blurb: "Hides behind the controller, so it looks like it floats on the wall. About 14 × 5 cm.",
    by: "GianfLab", profile: `${MWU}GianfLab`, model: `${MW}1057354-invisible-ps5-controller-holder-minimalist`, licence: "CC0",
    photo: `${MWIMG}US8b8332f60c19ba/design/2025-02-12_b75d3826506bc.jpg` },
  { key: "dualsense-stand", name: "DualSense desk stand", kind: "controller", price: 8, wix: [],
    blurb: "Stands one controller upright on a desk or shelf.",
    by: "James47889", profile: `${TVU}James47889`, model: `${TV}4654053`, licence: "CC0",
    photo: `${TVIMG}9d/f9/98/bd/f8/IMG-0358.jpg` },
  { key: "invisible-stand", name: "Invisible controller stand", kind: "controller", price: 8, wix: [],
    blurb: "A small stand you can't see from the front. The controller looks like it's standing on its own.",
    by: "ONI.FORGE", profile: `${MWU}ONI.FORGE`, model: `${MW}980334-invisible-ps5-controller-stand-holder`, licence: "BY",
    from: { name: "Xbox Invisible Stand", by: "Luke", model: `${MW}952139` },
    photo: `${MWIMG}US85f028e912d2b3/design/2025-01-11_65f6be8c19628.png` },
  { key: "stand-3", name: "Stand for 3 controllers", kind: "controller", price: 16, wix: [],
    blurb: "Holds three controllers side by side on the desk.",
    by: "Mike Guz", profile: `${MWU}wildcard_24`, model: `${MW}541289-ps5-controller-stand-3-controllers`, licence: "BY-SA",
    from: { name: "2-in-1 Switch Pro & PS5 Controller Stand", by: "ctrlaltrock", model: `${MW}440688` },
    photo: `${MWIMG}USbf07244d85ac91/design/2024-07-14_727b100cb4d0b.jpeg` },
  { key: "display-stand", name: "Display stand for 2 to 5 controllers", kind: "controller", price: 20, wix: [],
    blurb: "Shows off a collection of controllers in a tidy row. Tell us how many in the notes at checkout.",
    by: "nerdtalker", profile: `${MWU}nerdtalker`, model: `${MW}856128-vertical-2-3-4-or-5-controller-ps5-display-stand`, licence: "BY-SA",
    from: { name: "PS5 Controller Stand 3 Controllers", by: "Mike Guz", model: `${MW}541289` },
    photo: `${MWIMG}USe12f2a7550eb53/design/2024-12-16_190d5ae7a3fa9.jpeg` },
  { key: "two-holder", name: "Holder for 2 controllers", kind: "controller", price: 12, wix: [],
    blurb: "Two controllers on one desk stand, so the pair is always together.",
    by: "GIFK", profile: `${MWU}gera.tome`, model: `${MW}120609-ps5-2-controls-holder`, licence: "CC0",
    photo: `${MWIMG}USbfffa937859626/design/2024-01-07_a2ad05bbdf279.png` },
  { key: "double-holder", name: "Double controller holder", kind: "controller", price: 12, wix: [],
    blurb: "A neat, modern stand for two controllers.",
    by: "jazmine", profile: `${MWU}3dfacture`, model: `${MW}1449678-ps5-controller-holder-double`, licence: "CC0",
    photo: `${MWIMG}DSM00000001449678/design/2025-05-24_08a002e56267a.webp` },
  { key: "charging-dock", name: "Controller charging dock", kind: "controller", price: 14, wix: [],
    blurb: "A dock for two controllers. You add two USB-C cables and four M4 screws (not included).",
    by: "ThePrintsGioUniverse", profile: `${MWU}ThePrintsGioUni`, model: `${MW}148748-ps5-charging-dock`, licence: "BY",
    photo: `${MWIMG}US3fd145c6deabc3/design/2024-01-20_344bec730eb1e.jpg` },
  { key: "wall-mount", name: "Controller wall mount", kind: "controller", price: 8, wix: [],
    blurb: "Screws to the wall and holds one controller.",
    by: "Stridershouse", profile: `${TVU}stridershouse`, model: `${TV}4668997`, licence: "BY",
    photo: `${TVIMG}b3/18/fc/08/a7/IMG_6648.jpg` },
  { key: "skadis", name: "IKEA Skådis controller hook", kind: "controller", price: 8, wix: [],
    blurb: "Clips onto an IKEA Skådis pegboard and holds one controller.",
    by: "Apex 3D Prints UK", profile: `${MWU}Apex3DPrintsUK`, model: `${MW}240212-ps5-controller-mount-for-ikea-skadis`, licence: "BY",
    from: { name: "PS5 Controller Wall Mount", by: "Stridershouse", model: `${TV}4668997` },
    photo: `${MWIMG}US219aff5367004/design/2024-03-09_125ef17633e23.jpg` },
  { key: "skadis-hidden", name: "IKEA Skådis DualSense holder", kind: "controller", price: 8, wix: [],
    blurb: "A pegboard holder shaped to the DualSense controller.",
    by: "ZELENIUK", profile: `${MWU}ZELENIUK`, model: `${MW}2513044-skadis-ps5-dualsense-controller-holder`, licence: "CC0",
    photo: `${MWIMG}USa874fbdd39d58c/design/2b866fe83f1de05c.png` },
  { key: "console-hanger", name: "Hang-on-the-console hanger", kind: "controller", price: 12, wix: [],
    blurb: "Hooks over a standing PS5 and holds two controllers on its side.",
    by: "sa_shadow", profile: `${TVU}sa_shadow`, model: `${TV}4700712`, licence: "BY",
    photo: `${TVIMG}85/23/30/76/ce/controller-hanger.jpeg` },
  { key: "clip-2x", name: "Console clip for 2 controllers", kind: "controller", price: 12, wix: [],
    blurb: "Clips onto the PS5 so two controllers are stored right next to it.",
    by: "RS_666", profile: `${MWU}RS_666`, model: `${MW}153458-ps5-controller-stand-clip-2x`, licence: "BY",
    photo: `${MWIMG}USf69f4f010f384/design/2024-01-23_5d6286863dbef.jpg` },
  { key: "headset-mount", name: "Controller and headset wall mount", kind: "controller", price: 14, wix: [],
    blurb: "One wall mount for a controller with a hook for headphones underneath.",
    by: "Servito3D", profile: `${MWU}Servito3D`, model: `${MW}486470-ps5-controller-and-headphones-wall-mount`, licence: "BY-SA",
    from: { name: "PS5 controller and headphones holder", by: "Vlastimil", model: "https://www.printables.com/model/148285-ps5-controller-and-headphones-holder" },
    photo: `${MWIMG}DSM00000000486470/design/2024-06-08_171e4f34b5d5e.jpg` },
  { key: "skates", name: "Console feet (disc edition)", kind: "console", price: 10, wix: [],
    blurb: "Little feet that lift a lying-down PS5 disc edition off the shelf for better air flow.",
    by: "jmaxime89", profile: `${MWU}jmaxime89`, model: `${MW}25861-ps5-skates-disk-edition`, licence: "BY",
    photo: `${MWIMG}US34bce1ad0b4d40/design/2023-09-28_6ycrw8d1joet.jpg` },
  { key: "pro-stand", name: "PS5 Pro horizontal stand", kind: "console", price: 18, wix: [],
    blurb: "Holds a PS5 Pro steady when it lies flat.",
    by: "Delayh", profile: `${MWU}frknkrl5`, model: `${MW}1770439-ps5-pro-horizontal-stand`, licence: "CC0",
    photo: `${MWIMG}US9d1c5feb840f0/design/2025-09-06_6c8ef516ca4a9.png` },
  { key: "discreet-wall", name: "Hidden console wall mount", kind: "console", price: 22, wix: [],
    blurb: "Hangs the PS5 on the wall with the mount hidden behind it. Screws not included.",
    by: "killakrust", profile: `${TVU}killakrust`, model: `${TV}5752412`, licence: "BY",
    photo: `${TVIMG}e2/2d/59/fc/d0/538fde1f-2d28-4260-b68d-51862a80ba22.png` },
  { key: "disc-wall", name: "Console wall mount (disc edition)", kind: "console", price: 22, wix: [],
    blurb: "Puts a PS5 disc edition on the wall. Comes in a left or right version. Screws not included.",
    by: "Charly88", profile: `${TVU}Charly88`, model: `${TV}4751415`, licence: "BY",
    photo: `${TVIMG}5f/19/17/69/52/Ps5wallmountmirrored.png` },
  { key: "wall-mount-console", name: "Console wall bracket", kind: "console", price: 22, wix: [],
    blurb: "A sturdy bracket that holds the PS5 upright on the wall. Screws not included.",
    by: "Marijan89", profile: `${TVU}Marijan89`, model: `${TV}6028620`, licence: "BY",
    photo: `${TVIMG}fd/95/50/96/f5/13f1d425-9de0-4f0c-a46a-4cea9962b4d7.jpg` },
  { key: "flat-wall", name: "Flat console wall mount", kind: "console", price: 22, wix: [],
    blurb: "Hangs a PS5 disc edition flat against the wall. Screws not included.",
    by: "devilfvf", profile: `${MWU}devilfvf`, model: `${MW}2076359-ps5-horizontal-wall-mount`, licence: "BY-SA",
    photo: `${MWIMG}US1fc09d44632504/design/ea82da017084f954.jpeg` },
];

export const COLOURS = ["Midnight black", "Snow white", "Galaxy purple", "Sky blue", "Hot pink", "Neon green", "Fire orange", "Silver", "Glow in the dark"];

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const link = (href, text) => `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(text)}</a>`;

export function creditLine(p) {
  const lic = LICENCES[p.licence];
  return `${link(p.model, "Design")} by ${link(p.profile, p.by)}, ${link(lic.url, lic.name)}`
    + (p.from ? `. Remixed from ${link(p.from.model, p.from.name)} by ${esc(p.from.by)}` : "");
}

// The designers' photos are big; ask each site's image service for a 600 px copy.
const thumb = (u) => u.startsWith(TVIMG)
  ? `https://img.thingiverse.com/cdn-cgi/image/fit=cover,quality=85,width=600,height=600/${u}`
  : `${u}?x-oss-process=image/resize,w_600/format,webp`;

function card(p) {
  const [productId = "", variantId = ""] = p.wix;
  return `
    <article class="card ps5-card" data-kind="${p.kind}">
      ${p.top ? `<span class="ribbon">Most popular</span>` : ""}
      <img src="${esc(thumb(p.photo))}" alt="${esc(`${p.name}, designed by ${p.by}`)}" loading="lazy" referrerpolicy="no-referrer">
      <span class="ps5-kind">${p.kind === "console" ? "Console stand" : "Controller holder"}</span>
      <h3>${esc(p.name)}</h3>
      <p class="note">${esc(p.blurb)}</p>
      <div class="price">${money(p.price)}</div>
      <label class="custom-field">Colour
        <select data-key="Colour" data-required="true">${COLOURS.map((c) => `<option>${esc(c)}</option>`).join("")}</select>
      </label>
      <p class="note ps5-credit">${creditLine(p)}</p>
      <p class="error card-error" hidden></p>
      ${productId
        ? `<button class="btn" type="button" data-add="${esc(productId)}" data-variant="${esc(variantId)}">Add to cart</button>`
        : `<button class="btn" type="button" disabled>Orders open soon</button>`}
    </article>`;
}

const grid = document.getElementById("ps5-products");
if (grid) {
  grid.innerHTML = PS5_ITEMS.map(card).join("");
  const counts = { all: PS5_ITEMS.length, controller: 0, console: 0 };
  for (const p of PS5_ITEMS) counts[p.kind]++;
  for (const b of document.querySelectorAll("[data-ps5-filter]")) {
    b.querySelector("small").textContent = counts[b.dataset.ps5Filter];
    b.addEventListener("click", () => {
      for (const o of document.querySelectorAll("[data-ps5-filter]")) o.setAttribute("aria-pressed", String(o === b));
      for (const c of grid.querySelectorAll(".ps5-card")) c.hidden = b.dataset.ps5Filter !== "all" && c.dataset.kind !== b.dataset.ps5Filter;
    });
  }
}
