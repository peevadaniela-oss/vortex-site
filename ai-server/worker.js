// Vortex Toys AI model maker: a small Cloudflare Worker between the website and Meshy.
// It keeps the Meshy key secret, screens prompts, and caps how many models are made per day.
//
// Settings (Cloudflare dashboard → the Worker → Settings → Variables and Secrets / Bindings):
//   MESHY_API_KEY   secret: the key from meshy.ai/developers/keys
//   ALLOWED_ORIGIN  text: the website address, e.g. https://headless-otyskcpqdag-peevadaniela-140c.wix-site-host.com
//   DAILY_LIMIT     text (optional): models per day for the whole site, default 30
//   PER_VISITOR     text (optional): models per day for one visitor, default 3
//   LIMITS          KV namespace binding, used to count models per day
//
// Routes:
//   POST /generate      { prompt }  →  { id }
//   GET  /status/:id                →  { status, progress, thumbnail, error }
//   GET  /model/:id                 →  the model as .glb (add ?format=stl for printing)

const MESHY = "https://api.meshy.ai/openapi/v2/text-to-3d";
// added to every prompt so the result is one sturdy, printable object
const PRINTABLE = "A single solid toy for 3D printing: chunky rounded shapes, no thin or floating parts, flat base, no background.";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGIN || "").replace(/\/$/, "");
    const cors = {
      "Access-Control-Allow-Origin": allowed || "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };
    const json = (body, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (!env.MESHY_API_KEY) return json({ error: "The AI isn't set up yet." }, 503);

    const url = new URL(request.url);
    const meshy = (path = "", init = {}) =>
      fetch(MESHY + path, { ...init, headers: { Authorization: `Bearer ${env.MESHY_API_KEY}`, "Content-Type": "application/json" } });

    try {
      if (request.method === "POST" && url.pathname === "/generate") {
        // only the shop's own pages may start (and pay for) a model
        if (allowed && origin !== allowed) return json({ error: "Not allowed." }, 403);
        const { prompt } = await request.json().catch(() => ({}));
        const idea = String(prompt || "").replace(/\s+/g, " ").trim();
        if (idea.length < 3 || idea.length > 300) return json({ error: "Describe your idea in 3 to 300 characters." }, 400);

        const limit = await checkLimits(env, request.headers.get("CF-Connecting-IP") || "unknown");
        if (limit) return json({ error: limit }, 429);

        const res = await meshy("", {
          method: "POST",
          body: JSON.stringify({
            mode: "preview",
            prompt: `${idea}. ${PRINTABLE}`,
            moderation: true,
            should_remesh: true,
            target_polycount: 20000,
            target_formats: ["glb", "stl"],
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 400) return json({ error: "The AI can't make that one. Try describing a different idea." }, 400);
        if (!res.ok || !data.result) return json({ error: "The AI is busy right now. Please try again in a few minutes." }, 502);
        await countUse(env, request.headers.get("CF-Connecting-IP") || "unknown");
        return json({ id: data.result });
      }

      const status = url.pathname.match(/^\/status\/([\w-]+)$/);
      if (request.method === "GET" && status) {
        const res = await meshy(`/${status[1]}`);
        if (!res.ok) return json({ error: "Model not found." }, 404);
        const t = await res.json();
        return json({ status: t.status, progress: t.progress ?? 0, thumbnail: t.thumbnail_url || "", error: t.task_error?.message || "" });
      }

      const model = url.pathname.match(/^\/model\/([\w-]+)$/);
      if (request.method === "GET" && model) {
        const res = await meshy(`/${model[1]}`);
        if (!res.ok) return json({ error: "Model not found." }, 404);
        const t = await res.json();
        const format = url.searchParams.get("format") === "stl" ? "stl" : "glb";
        const file = t.model_urls?.[format];
        if (t.status !== "SUCCEEDED" || !file) return json({ error: "The model isn't ready yet." }, 409);
        const bytes = await fetch(file);
        if (!bytes.ok) return json({ error: "Couldn't fetch the model." }, 502);
        return new Response(bytes.body, {
          headers: {
            ...cors,
            "Content-Type": format === "stl" ? "model/stl" : "model/gltf-binary",
            "Content-Disposition": `inline; filename="vortex-${model[1]}.${format}"`,
            "Cache-Control": "public, max-age=86400",
          },
        });
      }

      return json({ error: "Not found." }, 404);
    } catch {
      return json({ error: "Something went wrong. Please try again." }, 500);
    }
  },
};

// ---- daily limits (counted in the LIMITS KV namespace) --------------------------------------------
const today = () => new Date().toISOString().slice(0, 10);
async function checkLimits(env, ip) {
  if (!env.LIMITS) return "The AI isn't set up yet."; // never run without a cap on the bill
  const [site, visitor] = await Promise.all([env.LIMITS.get(`site:${today()}`), env.LIMITS.get(`ip:${today()}:${ip}`)]);
  if (Number(site || 0) >= Number(env.DAILY_LIMIT || 30)) return "The AI has made all its models for today. Please come back tomorrow!";
  if (Number(visitor || 0) >= Number(env.PER_VISITOR || 3)) return "You've made all your AI models for today. Come back tomorrow for more!";
  return "";
}
async function countUse(env, ip) {
  if (!env.LIMITS) return;
  const opts = { expirationTtl: 60 * 60 * 48 };
  const keys = [`site:${today()}`, `ip:${today()}:${ip}`];
  await Promise.all(keys.map(async (k) => env.LIMITS.put(k, String(Number((await env.LIMITS.get(k)) || 0) + 1), opts)));
}
