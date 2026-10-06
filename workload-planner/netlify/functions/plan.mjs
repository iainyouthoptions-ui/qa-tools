import { getStore } from "@netlify/blobs";
import { createHash, timingSafeEqual } from "node:crypto";

const KEY = "plan";
const MAX_BYTES = 4 * 1024 * 1024;

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

function pinMatches(given) {
  const expected = process.env.PLANNER_PIN;
  if (!expected || typeof given !== "string") return false;
  // Hash both sides so the comparison is constant-time regardless of length.
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

// The page does the detailed checks when it loads a plan; the server only makes sure
// the shape is right so a bad save can't break the page for everyone.
function validPlan(plan) {
  if (!plan || typeof plan !== "object" || Array.isArray(plan)) return false;
  if (!plan.scenarios || typeof plan.scenarios !== "object" || Array.isArray(plan.scenarios)) return false;
  if (!plan.calendar || typeof plan.calendar !== "object") return false;
  if (!Array.isArray(plan.calendar.holidays) || !Array.isArray(plan.calendar.closures)) return false;
  return Object.values(plan.scenarios).every(
    (s) => s && typeof s === "object" && Array.isArray(s.cohorts) && Array.isArray(s.ongoing) && s.overrides && typeof s.overrides === "object"
  );
}

async function readPlan(store) {
  const current = await store.getWithMetadata(KEY, { type: "json" });
  if (!current) return { current: null, body: { plan: null, version: 0, updatedAt: null } };
  const meta = current.metadata || {};
  return {
    current,
    body: { plan: current.data, version: Number(meta.version) || 0, updatedAt: meta.updatedAt || null },
  };
}

export default async (req) => {
  const store = getStore({ name: "workload-planner", consistency: "strong" });

  if (req.method === "GET") {
    const { body } = await readPlan(store);
    return json(200, body);
  }

  if (req.method !== "POST") return json(405, { error: "Method not allowed." });

  if (!process.env.PLANNER_PIN) {
    return json(500, { error: "PLANNER_PIN is not set on the server." });
  }

  const raw = await req.text();
  if (raw.length > MAX_BYTES) return json(413, { error: "The plan is too large to save." });
  let body;
  try { body = JSON.parse(raw); } catch { return json(400, { error: "Bad JSON." }); }
  if (!body || typeof body !== "object") return json(400, { error: "Bad request." });

  if (!pinMatches(req.headers.get("x-planner-pin"))) {
    // Slow down guessing a little.
    await new Promise((r) => setTimeout(r, 750));
    return json(401, { error: "Wrong PIN." });
  }

  // "check" confirms the PIN (used by Editor unlock).
  if (body.action === "check") return json(200, { ok: true });

  if (body.action !== "save") return json(400, { error: "Unknown action." });
  if (!validPlan(body.plan)) return json(400, { error: "That plan is missing scenarios or holidays." });
  if (!Number.isInteger(body.baseVersion)) return json(400, { error: "baseVersion is required." });

  const { current, body: live } = await readPlan(store);

  // Someone else published since this editor loaded the plan: hand back the live one.
  if (live.version !== body.baseVersion) return json(409, { error: "A newer version was published.", ...live });

  const version = live.version + 1;
  const updatedAt = new Date().toISOString();
  // The local `netlify dev` blob server returns no etag on reads, so fall back to a plain write there.
  const cond = !current ? { onlyIfNew: true } : current.etag ? { onlyIfMatch: current.etag } : {};
  const { modified } = await store.setJSON(KEY, body.plan, { ...cond, metadata: { version, updatedAt } });
  if (!modified) {
    const { body: winner } = await readPlan(store);
    return json(409, { error: "A newer version was published.", ...winner });
  }
  return json(200, { version, updatedAt });
};

export const config = { path: "/api/plan" };
