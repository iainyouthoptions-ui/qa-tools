import { getStore } from "@netlify/blobs";
import { createHash, timingSafeEqual } from "node:crypto";

const SITES = new Set(["sturt", "salisbury"]);
const BUILDS = new Set(["b2", "b3"]);
const MAX_NAME = 40;

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

// Keep only well-formed marks: integer index 0-15 -> { name: string }.
function clean(obj) {
  const out = {};
  if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj)) {
      const i = Number(k), v = obj[k];
      if (Number.isInteger(i) && i >= 0 && i < 16 && v && typeof v.name === "string") {
        out[i] = { name: v.name.slice(0, MAX_NAME) };
      }
    }
  }
  return out;
}

function pinMatches(given) {
  const expected = process.env.BINGO_PIN;
  if (!expected || typeof given !== "string") return false;
  // Hash both sides so the comparison is constant-time regardless of length.
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

function cardKey(site, build) {
  return SITES.has(site) && BUILDS.has(build) ? `${site}-${build}` : null;
}

export default async (req) => {
  const store = getStore({ name: "bug-bingo", consistency: "strong" });

  if (req.method === "GET") {
    const url = new URL(req.url);
    const key = cardKey(url.searchParams.get("site"), url.searchParams.get("build"));
    if (!key) return json(400, { error: "Unknown site or build." });
    const marks = clean(await store.get(key, { type: "json" }));
    return json(200, { key, marks });
  }

  if (req.method !== "POST") return json(405, { error: "Method not allowed." });

  if (!process.env.BINGO_PIN) {
    return json(500, { error: "BINGO_PIN is not set on the server." });
  }

  let body;
  try { body = await req.json(); } catch { return json(400, { error: "Bad JSON." }); }
  if (!body || typeof body !== "object") return json(400, { error: "Bad request." });

  const key = cardKey(body.site, body.build);
  if (!key) return json(400, { error: "Unknown site or build." });

  const { action } = body;

  // Anyone can mark an empty square; clearing and resetting are facilitator-only.
  if (action !== "mark" && !pinMatches(req.headers.get("x-bingo-pin"))) {
    // Slow down guessing a little.
    await new Promise((r) => setTimeout(r, 750));
    return json(401, { error: "Wrong PIN." });
  }
  let index = null, name = null;

  if (action === "mark" || action === "clear") {
    index = body.index;
    if (!Number.isInteger(index) || index < 0 || index > 15) {
      return json(400, { error: "Square index must be 0 to 15." });
    }
  }
  if (action === "mark") {
    name = typeof body.name === "string" ? body.name.replace(/[\u0000-\u001f\u007f]/g, "").trim() : "";
    if (!name) return json(400, { error: "Name is required." });
    if (name.length > MAX_NAME) return json(400, { error: `Name must be ${MAX_NAME} characters or fewer.` });
  }
  if (!["mark", "clear", "reset", "check"].includes(action)) {
    return json(400, { error: "Unknown action." });
  }

  // "check" just confirms the PIN (used by Facilitator unlock) and returns the card unchanged.
  if (action === "check") {
    return json(200, { key, marks: clean(await store.get(key, { type: "json" })) });
  }

  // Read-modify-write with an etag check so simultaneous saves can't clobber each other.
  for (let attempt = 0; attempt < 5; attempt++) {
    const current = await store.getWithMetadata(key, { type: "json" });
    const marks = clean(current?.data);

    if (action === "mark" && marks[index]) {
      return json(409, { error: `${marks[index].name} already marked that square.`, taken: true, key, marks });
    }

    if (action === "mark") marks[index] = { name };
    else if (action === "clear") delete marks[index];
    else for (const k of Object.keys(marks)) delete marks[k];

    // The local `netlify dev` blob server returns no etag on reads, so fall back to a plain write there.
    const cond = !current ? { onlyIfNew: true } : current.etag ? { onlyIfMatch: current.etag } : {};
    const { modified } = await store.setJSON(key, marks, cond);
    if (modified) return json(200, { key, marks });
  }
  return json(409, { error: "Board is busy. Try again." });
};

export const config = { path: "/api/card" };
