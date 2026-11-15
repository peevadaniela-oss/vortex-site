// 3D Printed Designs checkout: a small Cloudflare Worker between the website and Stripe.
// The website keeps using its Wix cart. When a shopper presses Checkout, the page sends this
// Worker the shopper's Wix visitor token. The Worker reads that cart straight from Wix (so the
// prices always come from Wix and can't be changed in the browser), then opens a Stripe Checkout
// page for exactly those items. Stripe takes the card, collects the delivery address and emails
// the receipt. You see each order, with the names to print, in the Stripe dashboard.
//
// Settings (Cloudflare dashboard → the Worker → Settings → Variables and Secrets):
//   STRIPE_SECRET_KEY  secret: from dashboard.stripe.com/apikeys (starts with sk_live_ or sk_test_)
//   SITE_URL           text (optional): where shoppers come back to, default https://meshcraze.com
//   ALLOWED_ORIGINS    text (optional): comma-separated website addresses allowed to start a checkout,
//                      default https://meshcraze.com,https://www.meshcraze.com,https://vortex-site-2oi.pages.dev
//   SHIP_COUNTRIES     text (optional): two-letter country codes Stripe asks the address for,
//                      default the EU countries plus GB, CH, NO, US and CA
//   SHIPPING_FEE       text (optional): flat delivery price in the cart's currency, e.g. 4.50; default 0 (free)
//   FREE_SHIPPING_FROM text (optional): order total from which delivery is free, e.g. 40
//
// Routes:
//   POST /checkout  { wixToken }  →  { url }   (send the shopper to url)

const WIX = "https://www.wixapis.com";
const STRIPE = "https://api.stripe.com/v1";
const DEFAULT_ORIGINS = "https://meshcraze.com,https://www.meshcraze.com,https://vortex-site-2oi.pages.dev";
const DEFAULT_COUNTRIES =
  "BG,AT,BE,HR,CY,CZ,DK,EE,FI,FR,DE,GR,HU,IE,IT,LV,LT,LU,MT,NL,PL,PT,RO,SK,SI,ES,SE,GB,CH,NO,US,CA";
// Currencies Stripe counts in whole units (no cents).
const ZERO_DECIMAL = new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"]);

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || DEFAULT_ORIGINS).split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);
    const cors = {
      "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };
    const json = (body, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/checkout") return json({ error: "Not found." }, 404);
    if (origin && !allowed.includes(origin)) return json({ error: "Checkout isn't allowed from this site." }, 403);
    if (!env.STRIPE_SECRET_KEY) return json({ error: "Payments aren't switched on yet. Please try again soon." }, 503);

    try {
      const { wixToken } = await request.json().catch(() => ({}));
      if (typeof wixToken !== "string" || !wixToken) return json({ error: "Your cart couldn't be read. Please refresh the page." }, 400);

      // 1. The cart, read from Wix with the shopper's own visitor token.
      const cartRes = await fetch(`${WIX}/ecom/v2/carts/current`, { headers: { Authorization: wixToken } });
      if (cartRes.status === 404) return json({ error: "Your cart is empty." }, 400);
      if (!cartRes.ok) return json({ error: "Your cart couldn't be read. Please refresh the page." }, 502);
      const cart = (await cartRes.json())?.cart;
      const items = (cart?.lineItems ?? []).filter((l) => (l.quantityInfo?.confirmedQuantity ?? 0) > 0);
      if (!items.length) return json({ error: "Your cart is empty." }, 400);
      const bad = items.filter((l) => l.status && l.status !== "IN_STOCK");
      if (bad.length) return json({ error: `Some items are no longer available: ${bad.map((l) => text(l.name)).join(", ")}.` }, 400);

      const currency = String(cart.customerInfo?.currencyCode || cart.businessInfo?.currencyCode || "EUR").toUpperCase();
      const toMinor = (amount) => Math.round(Number(amount) * (ZERO_DECIMAL.has(currency) ? 1 : 100));

      // 2. The Stripe Checkout page, one line per cart line, priced from Wix.
      const form = new URLSearchParams();
      const site = (env.SITE_URL || "https://meshcraze.com").replace(/\/$/, "");
      form.set("mode", "payment");
      form.set("success_url", `${site}/thanks.html?order={CHECKOUT_SESSION_ID}`);
      form.set("cancel_url", `${site}/shop.html`);
      form.set("billing_address_collection", "auto");
      form.set("phone_number_collection[enabled]", "true");
      form.set("metadata[wix_cart_id]", String(cart.id ?? ""));
      (env.SHIP_COUNTRIES || DEFAULT_COUNTRIES).split(",").map((c) => c.trim().toUpperCase()).filter(Boolean)
        .forEach((c, i) => form.set(`shipping_address_collection[allowed_countries][${i}]`, c));

      let total = 0;
      items.forEach((l, i) => {
        const qty = l.quantityInfo?.confirmedQuantity ?? 1;
        const p = l.pricing ?? {};
        const money = (m) => m?.convertedAmount ?? m?.amount;
        const each = Number(money(p.unitPrice) ?? Number(money(p.totalPrice)) / qty);
        if (!Number.isFinite(each) || each < 0) throw new Error(`No price for ${text(l.name)}.`);
        total += each * qty;
        const details = describe(l);
        const key = `line_items[${i}]`;
        form.set(`${key}[quantity]`, String(qty));
        form.set(`${key}[price_data][currency]`, currency.toLowerCase());
        form.set(`${key}[price_data][unit_amount]`, String(toMinor(each)));
        form.set(`${key}[price_data][product_data][name]`, (text(l.name) || "3D printed toy").slice(0, 250));
        if (details) form.set(`${key}[price_data][product_data][description]`, details.slice(0, 500));
        const img = imageUrl(l);
        if (img) form.set(`${key}[price_data][product_data][images][0]`, img);
        // the details again, so they're on the payment in the dashboard too
        form.set(`metadata[item_${i + 1}]`, `${qty} × ${text(l.name)}${details ? ` (${details})` : ""}`.slice(0, 500));
      });

      const fee = Number(env.SHIPPING_FEE || 0);
      const freeFrom = Number(env.FREE_SHIPPING_FROM || 0);
      const shipping = fee > 0 && !(freeFrom > 0 && total >= freeFrom) ? fee : 0;
      form.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
      form.set("shipping_options[0][shipping_rate_data][display_name]", shipping ? "Delivery" : "Free delivery");
      form.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(toMinor(shipping)));
      form.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", currency.toLowerCase());

      const res = await fetch(`${STRIPE}/checkout/sessions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: form,
      });
      const session = await res.json();
      if (!res.ok || !session.url) {
        console.log("stripe error", res.status, session?.error?.message);
        return json({ error: "Checkout couldn't start. Please try again in a minute." }, 502);
      }
      return json({ url: session.url });
    } catch (e) {
      console.log("checkout error", e?.message);
      return json({ error: "Checkout couldn't start. Please try again in a minute." }, 500);
    }
  },
};

function text(t) {
  return typeof t === "string" ? t : t?.translated ?? t?.original ?? "";
}
// "Name: Nicole · Colour: Galaxy purple" from the line's options and typed-in text
function describe(l) {
  const parts = (l.attributes?.descriptionLines ?? l.descriptionLines ?? []).map((d) => {
    const label = text(d.name), value = text(d.plainText) || text(d.colorInfo);
    return label && value ? `${label}: ${value}` : value || label;
  });
  const typed = l.source?.catalogReference?.options?.customTextFields ?? {};
  for (const [k, v] of Object.entries(typed)) {
    if (v && !parts.some((p) => p.includes(String(v)))) parts.push(`${k}: ${v}`);
  }
  return parts.filter(Boolean).join(" · ");
}
function imageUrl(l) {
  const img = l.attributes?.image ?? l.image;
  const raw = typeof img === "string" ? img : img?.url ?? img?.id ?? "";
  if (!raw) return "";
  if (raw.startsWith("https://")) return raw;
  const m = String(raw).match(/^wix:image:\/\/v1\/([^/#]+)/);
  return m ? `https://static.wixstatic.com/media/${m[1]}` : "";
}
