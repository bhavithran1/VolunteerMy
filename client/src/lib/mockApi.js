// In-browser demo backend for GitHub Pages (no server required).
// Mirrors server.js against localStorage. DEMO auth only (plain-text passwords).

const DB_KEY = "volunteermy_mockdb";
const d = (off) => { const dt = new Date(); dt.setDate(dt.getDate() + off); return dt.toISOString().slice(0, 10); };

function seed() {
  return {
    seq: 100,
    users: [
      { id: 1, name: "Siti Aminah", email: "siti@reefcare.org", password: "password123", role: "organizer", org: "ReefCare Malaysia", skills: null },
      { id: 2, name: "Daniel Wong", email: "daniel@treesfor.my", password: "password123", role: "organizer", org: "Trees for Tomorrow", skills: null },
      { id: 3, name: "Arif Hakim", email: "arif@demo.com", password: "password123", role: "volunteer", org: null, skills: "Teaching, Logistics" },
    ],
    opportunities: [
      { id: 1, organizer_id: 1, title: "Coastal Cleanup — Port Dickson", description: "Help remove plastic from the shoreline and sort recyclables. Gloves & bags provided.", cause: "Environment", emoji: "🏖️", date: d(5), location: "Teluk Kemang, Port Dickson", hours: 4, slots: 30, slots_left: 30, status: "open" },
      { id: 2, organizer_id: 1, title: "Coral Nursery Maintenance", description: "Snorkel-assisted cleaning of coral nursery frames. Basic swimming required.", cause: "Environment", emoji: "🪸", date: d(12), location: "Pulau Tioman", hours: 6, slots: 12, slots_left: 12, status: "open" },
      { id: 3, organizer_id: 2, title: "Urban Tree Planting Day", description: "Plant 200 native saplings along the river corridor with local schools.", cause: "Environment", emoji: "🌳", date: d(3), location: "Taman Tugu, KL", hours: 3, slots: 40, slots_left: 40, status: "open" },
      { id: 4, organizer_id: 2, title: "Community Garden Build", description: "Build raised beds and compost bins for a low-income neighbourhood garden.", cause: "Community", emoji: "🌱", date: d(8), location: "Sentul, KL", hours: 5, slots: 20, slots_left: 20, status: "open" },
    ],
    signups: [],
  };
}

function load() {
  try { const raw = localStorage.getItem(DB_KEY); if (raw) return JSON.parse(raw); } catch { /* ignore */ }
  const db = seed(); save(db); return db;
}
const save = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db));
const nextId = (db) => ++db.seq;
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, org: u.org, skills: u.skills });
const tokenFor = (u) => `mock.${u.id}`;
const userFromToken = (db, t) => db.users.find((u) => u.id === Number(String(t || "").replace("mock.", ""))) || null;
const err = (s, m) => { const e = new Error(m); e.status = s; throw e; };
const todayStr = () => new Date().toISOString().slice(0, 10);

export async function mockApi(rawPath, { method = "GET", body, token } = {}) {
  const db = load();
  const [path, query = ""] = rawPath.split("?");
  const qp = new URLSearchParams(query);
  const me = userFromToken(db, token);

  if (path === "/auth/register" && method === "POST") {
    const { name, email, password, role, org, skills } = body || {};
    if (!name || !email || !password || !role) err(400, "Missing fields");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err(400, "Please enter a valid email");
    if (password.length < 6) err(400, "Password must be at least 6 characters");
    if (!["volunteer", "organizer"].includes(role)) err(400, "Invalid role");
    if (db.users.some((u) => u.email === email.toLowerCase())) err(409, "Email already registered");
    const u = { id: nextId(db), name, email: email.toLowerCase(), password, role, org: org || null, skills: skills || null };
    db.users.push(u); save(db);
    return { token: tokenFor(u), user: publicUser(u) };
  }
  if (path === "/auth/login" && method === "POST") {
    const u = db.users.find((x) => x.email === String(body?.email || "").toLowerCase());
    if (!u || u.password !== body?.password) err(401, "Invalid email or password");
    return { token: tokenFor(u), user: publicUser(u) };
  }
  if (path === "/auth/me") { if (!me) err(401, "Not authenticated"); return { user: publicUser(me) }; }

  if (path === "/opportunities" && method === "GET") {
    let rows = db.opportunities.filter((o) => o.status === "open" && o.date >= todayStr());
    const cause = qp.get("cause"); const q = (qp.get("q") || "").toLowerCase();
    if (cause && cause !== "All") rows = rows.filter((o) => o.cause === cause);
    if (q) rows = rows.filter((o) => (o.title + o.description).toLowerCase().includes(q));
    rows.sort((a, b) => a.date.localeCompare(b.date));
    return { opportunities: rows.map((o) => ({ ...o, org_name: db.users.find((u) => u.id === o.organizer_id)?.org })) };
  }
  if (path === "/opportunities/mine") {
    if (!me || me.role !== "organizer") err(403, "Requires organizer account");
    const rows = db.opportunities.filter((o) => o.organizer_id === me.id)
      .map((o) => ({ ...o, signups: db.signups.filter((s) => s.opportunity_id === o.id).length }))
      .sort((a, b) => a.date.localeCompare(b.date));
    return { opportunities: rows };
  }
  if (path === "/opportunities" && method === "POST") {
    if (!me || me.role !== "organizer") err(403, "Requires organizer account");
    const b = body || {};
    if (!b.title || !b.cause || !b.date || !b.location || !b.slots) err(400, "Missing fields");
    const o = { id: nextId(db), organizer_id: me.id, title: b.title, description: b.description || "", cause: b.cause, emoji: b.emoji || "🤝", date: b.date, location: b.location, hours: b.hours || 3, slots: b.slots, slots_left: b.slots, status: "open" };
    db.opportunities.push(o); save(db); return { opportunity: o };
  }
  const om = path.match(/^\/opportunities\/(\d+)$/);
  if (om && method === "DELETE") {
    const o = db.opportunities.find((x) => x.id === Number(om[1]));
    if (!me || me.role !== "organizer" || !o || o.organizer_id !== me.id) err(404, "Not found");
    db.signups = db.signups.filter((s) => s.opportunity_id !== o.id);
    db.opportunities = db.opportunities.filter((x) => x.id !== o.id);
    save(db); return { ok: true };
  }

  if (path === "/signups" && method === "POST") {
    if (!me || me.role !== "volunteer") err(403, "Requires volunteer account");
    const o = db.opportunities.find((x) => x.id === body?.opportunity_id);
    if (!o || o.status !== "open") err(404, "Opportunity unavailable");
    if (o.slots_left < 1) err(400, "Fully booked");
    if (db.signups.some((s) => s.opportunity_id === o.id && s.volunteer_id === me.id)) err(409, "Already signed up");
    o.slots_left -= 1;
    db.signups.push({ id: nextId(db), opportunity_id: o.id, volunteer_id: me.id, status: "confirmed", hours_logged: 0 });
    save(db); return { ok: true };
  }
  if (path === "/signups/mine") {
    if (!me || me.role !== "volunteer") err(403, "Requires volunteer account");
    const rows = db.signups.filter((s) => s.volunteer_id === me.id).map((s) => {
      const o = db.opportunities.find((x) => x.id === s.opportunity_id) || {};
      const org = db.users.find((u) => u.id === o.organizer_id) || {};
      return { ...s, title: o.title, emoji: o.emoji, cause: o.cause, date: o.date, location: o.location, hours: o.hours, org_name: org.org };
    }).sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    return { signups: rows };
  }
  const lm = path.match(/^\/signups\/(\d+)\/log$/);
  if (lm && method === "PATCH") {
    const s = db.signups.find((x) => x.id === Number(lm[1]));
    if (!me || !s || s.volunteer_id !== me.id) err(404, "Not found");
    const o = db.opportunities.find((x) => x.id === s.opportunity_id) || {};
    s.status = "completed"; s.hours_logged = o.hours || 0; save(db); return { ok: true };
  }

  if (path === "/stats") {
    return {
      volunteers: db.users.filter((u) => u.role === "volunteer").length,
      orgs: db.users.filter((u) => u.role === "organizer").length,
      hours: db.signups.reduce((s, x) => s + (x.hours_logged || 0), 0),
      opportunities: db.opportunities.length,
    };
  }
  if (path === "/health") return { ok: true, service: "volunteermy-mock" };

  err(404, "Not found");
}
