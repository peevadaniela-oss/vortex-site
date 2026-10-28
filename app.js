// Vortex Toys storefront: talks to Wix as a visitor over plain fetch.
// Transport follows the Wix headless kit's shared/rest/client.ts; the mappers are copied from
// storefront catalog-core.ts and cart-core.ts with the types removed.
const WIX_CLIENT_ID = "f74a8f97-ba38-4e11-abac-62fb8a213de5";
const CATEGORY_SLUG = "fidget-toys";
const WIX_STORES_APP_ID = "215238eb-22a5-4c36-9e7b-e7c08025e04e";

// ---- client (visitor token = the shopper's cart) ---------------------------------------------
const API = "https://www.wixapis.com";
const STORAGE_KEY = `wix-visitor-${WIX_CLIENT_ID}`;
let memory = null;
const loadTokens = () => {
  if (memory) return memory;
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) memory = JSON.parse(raw); } catch { /* no storage */ }
  return memory;
};
const saveTokens = (t) => {
  memory = t;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); } catch { /* no storage */ }
};
async function mintTokens(body) {
  const res = await fetch(`${API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId: WIX_CLIENT_ID, ...body }),
  });
  if (!res.ok) throw new Error(`Wix auth failed (${res.status}).`);
  const d = await res.json();
  return { accessToken: d.access_token, refreshToken: d.refresh_token, expiresAt: Date.now() + d.expires_in * 1000 };
}
async function accessToken() {
  const t = loadTokens();
  if (t && t.expiresAt - 60_000 > Date.now()) return t.accessToken;
  let fresh;
  if (t?.refreshToken) {
    try { fresh = await mintTokens({ grantType: "refresh_token", refreshToken: t.refreshToken }); } catch { /* new visitor */ }
  }
  fresh ??= await mintTokens({ grantType: "anonymous" });
  saveTokens(fresh);
  return fresh.accessToken;
}
class WixApiError extends Error {
  constructor(message, status, code) { super(message); this.status = status; this.code = code; }
}
async function wixRequest(path, { method = "POST", body, query } = {}) {
  const url = new URL(path, API);
  for (const [k, v] of Object.entries(query ?? {})) for (const item of Array.isArray(v) ? v : [v]) url.searchParams.append(k, String(item));
  const res = await fetch(url, {
    method,
    headers: { Authorization: await accessToken(), "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    let message = "", code;
    try { const j = await res.json(); message = j?.message ?? ""; code = j?.details?.applicationError?.code; } catch { /* no body */ }
    throw new WixApiError(message || `${method} ${url.pathname} failed (${res.status}).`, res.status, code);
  }
  return res.status === 204 ? null : res.json();
}

// ---- media (from shared/rest/media.ts) --------------------------------------------------------
const BARE_FILE_ID = /^[\w-]+~mv2\.[a-z0-9]+$/i;
function rawOf(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value.image != null && typeof value.image === "object") return rawOf(value.image);
  return (typeof value.image === "string" ? value.image : null) ?? value.url ?? value.id ?? "";
}
function fileOf(v) {
  if (v.startsWith("wix:image://")) return v.slice("wix:image://v1/".length).split("/")[0].split("#")[0];
  if (BARE_FILE_ID.test(v)) return v;
  const m = v.match(/^https:\/\/static\.wixstatic\.com\/media\/([^/?#]+)/);
  return m ? m[1] : "";
}
function imgSrc(value, width = 600, height = 600) {
  const v = rawOf(value);
  if (!v) return "";
  const file = fileOf(v);
  return file ? `https://static.wixstatic.com/media/${file}/v1/fill/w_${width},h_${height},al_c,q_90/${file}` : v;
}
function mediaKey(value) {
  const v = rawOf(value);
  if (!v) return "";
  if (v.startsWith("wix:image://")) return v.slice("wix:image://v1/".length).split("/")[0].split("#")[0];
  const m = v.match(/^https:\/\/static\.wixstatic\.com\/media\/([^/?#]+)/);
  return m ? m[1] : v;
}

// ---- catalog-core (copied) --------------------------------------------------------------------
const rid = (raw) => raw?._id ?? raw?.id ?? "";
const LIST_FIELDS = ["CURRENCY", "MEDIA_ITEMS_INFO", "MIN_PRICE_VARIANT", "DISCOUNT_INFO"];
function sellingPrice(price) {
  if (price?.priceAfterDiscount !== undefined) return { current: price.priceAfterDiscount, original: price.actualPrice };
  return { current: price?.actualPrice, original: price?.compareAtPrice };
}
function strike(original, current) {
  const o = Number(original?.amount), c = Number(current?.amount);
  return original?.formattedAmount && Number.isFinite(o) && Number.isFinite(c) && o > c ? original.formattedAmount : null;
}
function ribbonsOf(raw) {
  return [raw.ribbon?.name, ...(raw.additionalRibbons ?? []).map((r) => r?.name)]
    .filter((n, i, all) => typeof n === "string" && n.length > 0 && all.indexOf(n) === i);
}
function toAvailability(raw) {
  const s = raw.inventory?.availabilityStatus;
  return s === "OUT_OF_STOCK" || s === "PARTIALLY_OUT_OF_STOCK" ? s : "IN_STOCK";
}
function isPreorderProduct(raw) {
  const availability = toAvailability(raw);
  const pa = raw.inventory?.preorderAvailability;
  if (pa) return pa === "ALL_VARIANTS" || (pa === "SOME_VARIANTS" && availability === "OUT_OF_STOCK");
  return raw.inventory?.preorderStatus === "ENABLED" && availability === "OUT_OF_STOCK";
}
function mediaEntries(raw) {
  const out = [], seen = new Set();
  for (const m of [raw.media?.main, ...(raw.media?.itemsInfo?.items ?? [])]) {
    const v = m?.image ?? m;
    const k = mediaKey(v);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}
function toModifiers(raw) {
  return (raw.modifiers ?? []).map((m) => {
    const isText = m.modifierRenderType === "FREE_TEXT";
    const ft = m.freeTextSettings ?? {};
    const charCount = (v) => (typeof v === "number" && v > 0 ? v : null);
    return {
      key: isText ? ft.key ?? m.key ?? m.name ?? "" : m.key ?? m.name ?? "",
      name: m.name ?? "",
      mandatory: m.mandatory !== false,
      type: isText ? "text" : "choices",
      title: (isText ? ft.title : undefined) || m.name || "",
      maxChars: isText ? charCount(ft.maxCharCount) : null,
    };
  });
}
const visibleSubscriptions = (raw) => (raw.subscriptionDetails?.subscriptions ?? []).filter((s) => s.visible !== false);
function toSummary(raw) {
  const options = raw.options ?? [];
  const media = mediaEntries(raw);
  const availability = toAvailability(raw);
  const min = raw.actualPriceRange?.minValue, max = raw.actualPriceRange?.maxValue;
  const isRange = !!(min?.amount && max?.amount && min.amount !== max.amount);
  const minVariant = raw.variantSummary?.minPriceVariant;
  const { current, original } = sellingPrice(minVariant?.price);
  const discounted = minVariant?.price?.priceAfterDiscount !== undefined;
  const price = current?.formattedAmount ?? min?.formattedAmount ?? "";
  const fromPrice = isRange && discounted;
  const ribbons = ribbonsOf(raw);
  const hasSubscriptions = visibleSubscriptions(raw).length > 0;
  return {
    id: rid(raw),
    slug: raw.slug ?? "",
    name: raw.name ?? "",
    price,
    maxPrice: fromPrice ? price : max?.formattedAmount ?? "",
    fromPrice,
    isRange,
    compareAtPrice: isRange ? null : strike(original ?? raw.compareAtPriceRange?.minValue, current ?? min),
    ribbon: ribbons[0] ?? null,
    minPriceVariantId: minVariant ? rid(minVariant) || minVariant.variantId || null : null,
    availability,
    preorder: isPreorderProduct(raw),
    imageUrl: imgSrc(media[0], 800, 800),
    quickAddable: options.length === 0 && availability === "IN_STOCK" && !hasSubscriptions,
    hasOptions: options.length > 0 && !hasSubscriptions,
    textModifiers: toModifiers(raw).filter((m) => m.type === "text"),
  };
}

// ---- cart-core (copied) -----------------------------------------------------------------------
function formatMoney(money, currencyCode) {
  const value = money?.convertedAmount ?? money?.amount;
  if (value == null || value === "") return "";
  const currency = currencyCode || "USD";
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(value)); } catch { return `${value} ${currency}`; }
}
const cartCurrency = (raw) => raw?.customerInfo?.currencyCode ?? raw?.businessInfo?.currencyCode ?? raw?.currency ?? "";
const translated = (t) => (typeof t === "string" ? t : t?.translated ?? t?.original ?? "");
function toLine(raw, currency) {
  return {
    lineItemId: rid(raw),
    productName: translated(raw.name),
    quantity: raw.quantityInfo?.confirmedQuantity ?? 0,
    linePrice: formatMoney(raw.pricing?.totalPrice, currency),
    descriptionLines: (raw.attributes?.descriptionLines ?? raw.descriptionLines ?? [])
      .map((d) => {
        const label = translated(d.name), value = translated(d.plainText) || translated(d.colorInfo);
        return label && value ? `${label}: ${value}` : value || label;
      })
      .filter(Boolean),
    status: raw.status ?? "IN_STOCK",
  };
}
const CART_ERRORS = {
  ITEM_NOT_FOUND_IN_CATALOG: "This item is no longer available.",
  INSUFFICIENT_INVENTORY: "This item is now out of stock.",
};
function cartErrorMessage(err, fallback = "Something went wrong with your cart. Please try again.") {
  const code = err?.code;
  if (code && CART_ERRORS[code]) return CART_ERRORS[code];
  return (err instanceof Error ? err.message : "") || fallback;
}
function assertAdded(cart, productId, variantId) {
  const line = (cart?.lineItems ?? []).find(
    (l) => l.source?.catalogReference?.catalogItemId === productId && (!variantId || l.source?.catalogReference?.options?.variantId === variantId),
  );
  if (line?.status && line.status !== "IN_STOCK") throw new Error(`This item isn't available right now (${String(line.status).toLowerCase().replace(/_/g, " ")}).`);
  if (!line || line.quantityInfo?.confirmedQuantity === 0) throw new Error("The item couldn't be added. Please try again.");
}
function assertCheckoutable(raw) {
  const lines = raw?.lineItems ?? [];
  if (!lines.length) throw new Error("Your cart is empty.");
  const unavailable = lines.filter((l) => l.status && l.status !== "IN_STOCK");
  if (unavailable.length) throw new Error(`Some items are no longer available: ${unavailable.map((l) => translated(l.name)).filter(Boolean).join(", ")}.`);
  if (!rid(raw)) throw new Error("Checkout couldn't start: the cart has no id.");
}

// ---- cart calls (from storefront/rest/cart.ts) ------------------------------------------------
const CART = "/ecom/v2/carts/current";
async function getCurrentCartRaw() {
  try { return (await wixRequest(CART, { method: "GET" }))?.cart ?? null; }
  catch (e) { if (e instanceof WixApiError && e.status === 404) return null; throw e; }
}
async function readCart(raw) {
  const currency = cartCurrency(raw);
  const lines = (raw?.lineItems ?? []).map((l) => toLine(l, currency));
  let subtotal = "";
  if (lines.length) {
    try {
      const est = await wixRequest(`${CART}/estimate`, { body: { calculateTax: true, calculateAdditionalFees: true } });
      subtotal = formatMoney(est?.summary?.priceSummary?.subtotal, currency || cartCurrency(est?.cart));
    } catch { /* display nicety */ }
  }
  return { lines, itemCount: lines.reduce((n, l) => n + l.quantity, 0), subtotal };
}
const loud = async (op) => { try { return await op(); } catch (e) { throw new Error(cartErrorMessage(e)); } };
const addToCart = (productId, variantId, customTextFields = {}) => loud(async () => {
  const options = {};
  if (variantId) options.variantId = variantId;
  if (Object.keys(customTextFields).length) options.customTextFields = customTextFields;
  const res = await wixRequest(`${CART}/add-line-items`, {
    body: { catalogItems: [{ quantity: 1, catalogReference: { catalogItemId: productId, appId: WIX_STORES_APP_ID, ...(Object.keys(options).length ? { options } : {}) } }] },
  });
  assertAdded(res?.cart, productId, variantId);
  return readCart(res?.cart ?? null);
});
const updateQuantity = (lineItemId, quantity) => loud(async () => {
  const res = await wixRequest(`${CART}/update-line-items`, { body: { lineItems: [{ lineItemId, quantity: { newQuantity: quantity } }] } });
  return readCart(res?.cart ?? null);
});
const removeLine = (lineItemId) => loud(async () => {
  const res = await wixRequest(`${CART}/remove-line-items`, { body: { lineItemIds: [lineItemId] } });
  return readCart(res?.cart ?? null);
});
async function checkoutUrl() {
  const raw = await getCurrentCartRaw();
  assertCheckoutable(raw);
  const origin = window.location.origin;
  const res = await wixRequest("/headless/v1/redirect-session", {
    body: { ecomCheckout: { checkoutId: rid(raw) }, callbacks: { postFlowUrl: `${origin}/`, thankYouPageUrl: `${origin}/` } },
  });
  const url = res?.redirectSession?.fullUrl;
  if (!url) throw new Error("Checkout couldn't start: no redirect URL returned.");
  return url;
}

// ---- rendering --------------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function renderCart(cart) {
  $("cart-count").textContent = String(cart.itemCount);
  $("cart-subtotal").textContent = cart.subtotal || "–";
  $("checkout").disabled = cart.lines.length === 0;
  $("cart-lines").innerHTML = cart.lines.length
    ? cart.lines.map((l) => `
      <div class="line">
        <div><strong>${esc(l.productName)}</strong>${l.descriptionLines.map((d) => `<div class="note">${esc(d)}</div>`).join("")}${l.status !== "IN_STOCK" ? `<div class="error">Not available</div>` : ""}</div>
        <div>${esc(l.linePrice)}</div>
        <div class="qty">
          <button type="button" data-dec="${esc(l.lineItemId)}" data-q="${l.quantity}" aria-label="One less">−</button>
          <span>${l.quantity}</span>
          <button type="button" data-inc="${esc(l.lineItemId)}" data-q="${l.quantity}" aria-label="One more">+</button>
        </div>
        <button type="button" class="link-btn" data-remove="${esc(l.lineItemId)}">Remove</button>
      </div>`).join("")
    : `<p class="status">Your cart is empty.</p>`;
}
function showCartError(msg) {
  const el = $("cart-error");
  el.hidden = !msg;
  el.textContent = msg || "";
}
function openCart(open) {
  $("drawer").classList.toggle("open", open);
  $("drawer-bg").classList.toggle("open", open);
}
async function cartAction(op) {
  showCartError("");
  try { renderCart(await op()); } catch (e) { showCartError(e.message); }
}

// Products with options (e.g. which dragon): read their variants so the card can offer a picker.
async function withChoices(p) {
  if (!p.hasOptions) return p;
  try {
    const res = await wixRequest(`/stores/v3/products/${p.id}`, { method: "GET", query: { fields: ["VARIANT_OPTION_CHOICE_NAMES"] } });
    const raw = res?.product;
    const optionList = (raw?.options ?? []).map((o) => ({
      name: o.name,
      choices: (o.choicesSettings?.choices ?? []).filter((c) => c.visible !== false).map((c) => ({
        name: c.name,
        image: c.linkedMedia?.[0] ? imgSrc(c.linkedMedia[0], 800, 800) : "",
      })),
    }));
    const variants = (raw?.variantsInfo?.variants ?? []).filter((v) => v.visible !== false).map((v) => ({
      id: rid(v),
      names: Object.fromEntries((v.choices ?? []).map((c) => [c.optionChoiceNames?.optionName, c.optionChoiceNames?.choiceName])),
      price: v.price?.actualPrice?.formattedAmount ?? "",
      inStock: v.inventoryStatus?.inStock !== false,
    }));
    return variants.length ? { ...p, optionList, variants } : p;
  } catch {
    return p;
  }
}
const pickedVariant = (p, picked) => p.variants.find((v) => p.optionList.every((o) => v.names[o.name] === picked[o.name]));

function productCard(p) {
  const image = p.imageUrl
    ? `<img src="${esc(p.imageUrl)}" alt="${esc(p.name)}" loading="lazy">`
    : `<div class="ph">Photo coming soon</div>`;
  const price = p.fromPrice ? `From ${esc(p.price)}` : p.isRange ? `${esc(p.price)} – ${esc(p.maxPrice)}` : esc(p.price);
  if (p.optionList) return optionCard(p, image, price);
  const canAdd = p.quickAddable || p.preorder;
  return `
    <article class="card">
      ${p.ribbon ? `<span class="ribbon">${esc(p.ribbon)}</span>` : ""}
      ${image}
      <h3>${esc(p.name)}</h3>
      <div class="price">${price}${p.compareAtPrice ? `<s>${esc(p.compareAtPrice)}</s>` : ""}</div>
      ${p.textModifiers.map((m) => `
        <label class="custom-field">${esc(m.title)}${m.mandatory ? "" : " (optional)"}
          <input type="text" data-key="${esc(m.key)}" data-required="${m.mandatory}" ${m.maxChars ? `maxlength="${m.maxChars}"` : ""} placeholder="${/colou?r/i.test(m.title) ? "e.g. Purple" : "e.g. Nicole"}">
        </label>`).join("")}
      <p class="error card-error" hidden></p>
      ${canAdd
        ? `<button class="btn" type="button" data-add="${esc(p.id)}" data-variant="${esc(p.minPriceVariantId ?? "")}">${p.preorder ? "Pre-order" : "Add to cart"}</button>`
        : `<button class="btn" type="button" disabled>${p.availability === "OUT_OF_STOCK" ? "Sold out" : "Unavailable"}</button>`}
    </article>`;
}

function optionCard(p, image, price) {
  const picked = Object.fromEntries(p.optionList.map((o) => [o.name, o.choices[0]?.name]));
  const v = pickedVariant(p, picked);
  const first = p.optionList[0]?.choices[0];
  return `
    <article class="card" data-product="${esc(p.id)}">
      ${p.ribbon ? `<span class="ribbon">${esc(p.ribbon)}</span>` : ""}
      ${first?.image ? `<img src="${esc(first.image)}" alt="${esc(`${p.name}: ${first.name}`)}" loading="lazy">` : image}
      <h3>${esc(p.name)}</h3>
      <div class="price">${esc(v?.price || price)}</div>
      ${p.optionList.map((o) => `
        <div class="option-pick" role="group" aria-label="${esc(o.name)}">
          <span class="sub">Choose your ${esc(o.name.toLowerCase())}</span>
          <div class="option-chips">${o.choices.map((c, i) => `
            <button type="button" class="option-chip" data-option="${esc(o.name)}" data-choice="${esc(c.name)}" data-image="${esc(c.image)}" aria-pressed="${i === 0}">
              ${c.image ? `<img src="${esc(c.image)}" alt="" loading="lazy">` : ""}<span>${esc(c.name)}</span>
            </button>`).join("")}
          </div>
        </div>`).join("")}
      ${p.textModifiers.map((m) => `
        <label class="custom-field">${esc(m.title)}${m.mandatory ? "" : " (optional)"}
          <input type="text" data-key="${esc(m.key)}" data-required="${m.mandatory}" ${m.maxChars ? `maxlength="${m.maxChars}"` : ""} placeholder="${/colou?r/i.test(m.title) ? "e.g. Purple" : "e.g. Nicole"}">
        </label>`).join("")}
      <p class="error card-error" hidden></p>
      <button class="btn" type="button" data-add="${esc(p.id)}" data-variant="${esc(v?.id ?? "")}" ${v?.inStock === false ? "disabled" : ""}>${v?.inStock === false ? "Sold out" : "Add to cart"}</button>
    </article>`;
}
const shownProducts = new Map();
function pickChoice(chip) {
  const card = chip.closest(".card"), p = shownProducts.get(card?.dataset.product);
  if (!p) return;
  for (const c of card.querySelectorAll(`[data-option="${CSS.escape(chip.dataset.option)}"]`)) c.setAttribute("aria-pressed", String(c === chip));
  const picked = Object.fromEntries([...card.querySelectorAll('.option-chip[aria-pressed="true"]')].map((c) => [c.dataset.option, c.dataset.choice]));
  const v = pickedVariant(p, picked);
  const img = card.querySelector(":scope > img");
  if (img && chip.dataset.image) { img.src = chip.dataset.image; img.alt = `${p.name}: ${chip.dataset.choice}`; }
  if (v?.price) card.querySelector(".price").textContent = v.price;
  const add = card.querySelector("[data-add]");
  add.dataset.variant = v?.id ?? "";
  add.disabled = !v || v.inStock === false;
  add.textContent = !v || v.inStock === false ? "Sold out" : "Add to cart";
}

async function loadCategory(slug, gridId, descId) {
  const grid = $(gridId);
  if (!grid) return;
  try {
    const cat = await wixRequest(`/categories/v1/categories/slug/${slug}`, {
      method: "GET",
      query: { "treeReference.appNamespace": "@wix/stores", fields: ["DESCRIPTION"] },
    });
    const category = cat?.category;
    if (category?.description && $(descId)) $(descId).textContent = category.description;
    const res = await wixRequest("/stores/v3/products/search", {
      body: {
        fields: LIST_FIELDS,
        search: {
          cursorPaging: { limit: 100 },
          filter: { $and: [{ visible: true }, { "allCategoriesInfo.categories": { $matchItems: [{ id: category.id }] } }] },
        },
      },
    });
    const products = await Promise.all((res?.products ?? []).map(toSummary).map(withChoices));
    for (const p of products) shownProducts.set(p.id, p);
    grid.innerHTML = products.length ? products.map(productCard).join("") : `<p class="status">New toys are on the printer. Check back soon!</p>`;
  } catch (e) {
    grid.innerHTML = `<p class="status error">We couldn't load the toys right now. Please refresh the page.</p>`;
  }
}

document.addEventListener("click", async (ev) => {
  const t = ev.target.closest("button");
  if (!t) return;
  if (t.id === "cart-open") { openCart(true); return; }
  if (t.id === "cart-close") { openCart(false); return; }
  if (t.dataset.choice) { pickChoice(t); return; }
  if (t.dataset.add) {
    const card = t.closest(".card");
    const cardError = card?.querySelector(".card-error");
    const fields = {};
    let missing = "";
    for (const input of card?.querySelectorAll("input[data-key]") ?? []) {
      const value = input.value.trim();
      if (value) fields[input.dataset.key] = value;
      else if (input.dataset.required === "true") missing ||= "Please type the name you want printed.";
    }
    if (cardError) { cardError.hidden = !missing; cardError.textContent = missing; }
    if (missing) return;
    t.disabled = true;
    const label = t.textContent;
    t.textContent = "Adding…";
    await cartAction(() => addToCart(t.dataset.add, t.dataset.variant || null, fields));
    t.disabled = false;
    t.textContent = label;
    openCart(true);
    return;
  }
  if (t.dataset.inc) return cartAction(() => updateQuantity(t.dataset.inc, Number(t.dataset.q) + 1));
  if (t.dataset.dec) {
    const q = Number(t.dataset.q) - 1;
    return cartAction(() => (q < 1 ? removeLine(t.dataset.dec) : updateQuantity(t.dataset.dec, q)));
  }
  if (t.dataset.remove) return cartAction(() => removeLine(t.dataset.remove));
  if (t.id === "checkout") {
    t.disabled = true;
    showCartError("");
    try { window.location.href = await checkoutUrl(); }
    catch (e) { showCartError(e.message); t.disabled = false; }
  }
});
$("drawer-bg").addEventListener("click", () => openCart(false));

loadCategory("fidget-toys", "products", "cat-desc");
loadCategory("customizable-items", "custom-products", "custom-desc");
readCart(await getCurrentCartRaw().catch(() => null)).then(renderCart).catch(() => {});
