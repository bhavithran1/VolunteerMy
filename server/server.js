import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db.js";
import { securityHeaders, rateLimit, errorHandler, isEmail, isStrongPassword, sanitizeStr } from "./middleware.js";

const app = express();
const PORT = process.env.PORT || 4003;
const JWT_SECRET = process.env.JWT_SECRET || "volunteermy-dev-secret";

app.set("trust proxy", true);
app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use(securityHeaders);
const authLimiter = rateLimit({ windowMs: 60_000, max: 10, key: "auth" });

const sign = (u) => jwt.sign({ id: u.id, role: u.role }, JWT_SECRET, { expiresIn: "7d" });
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, org: u.org, skills: u.skills });

function auth(required = true, role = null) {
  return (req, res, next) => {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (!token) { if (required) return res.status(401).json({ error: "Not authenticated" }); return next(); }
    try {
      const { id } = jwt.verify(token, JWT_SECRET);
      const user = db.prepare("SELECT * FROM users WHERE id=?").get(id);
      if (!user) return res.status(401).json({ error: "User not found" });
      if (role && user.role !== role) return res.status(403).json({ error: `Requires ${role} account` });
      req.user = user; next();
    } catch { if (required) return res.status(401).json({ error: "Invalid token" }); next(); }
  };
}

// ---------- auth ----------
app.post("/api/auth/register", authLimiter, (req, res) => {
  let { name, email, password, role, org, skills } = req.body || {};
  name = sanitizeStr(name, 80); email = sanitizeStr(email, 120)?.toLowerCase();
  org = sanitizeStr(org, 120); skills = sanitizeStr(skills, 200);
  if (!name || !email || !password || !role) return res.status(400).json({ error: "Missing fields" });
  if (!isEmail(email)) return res.status(400).json({ error: "Please enter a valid email" });
  if (!isStrongPassword(password)) return res.status(400).json({ error: "Password must be at least 6 characters" });
  if (!["volunteer", "organizer"].includes(role)) return res.status(400).json({ error: "Invalid role" });
  if (db.prepare("SELECT id FROM users WHERE email=?").get(email)) return res.status(409).json({ error: "Email already registered" });
  const info = db.prepare("INSERT INTO users (name,email,password_hash,role,org,skills) VALUES (?,?,?,?,?,?)")
    .run(name, email, bcrypt.hashSync(password, 10), role, org || null, skills || null);
  const user = db.prepare("SELECT * FROM users WHERE id=?").get(info.lastInsertRowid);
  res.json({ token: sign(user), user: publicUser(user) });
});

app.post("/api/auth/login", authLimiter, (req, res) => {
  const email = sanitizeStr(req.body?.email, 120)?.toLowerCase();
  const { password } = req.body || {};
  const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!user || !bcrypt.compareSync(password || "", user.password_hash)) return res.status(401).json({ error: "Invalid email or password" });
  res.json({ token: sign(user), user: publicUser(user) });
});

app.get("/api/auth/me", auth(), (req, res) => res.json({ user: publicUser(req.user) }));

// ---------- opportunities ----------
app.get("/api/opportunities", (req, res) => {
  const { cause, q } = req.query;
  let sql = `SELECT o.*, u.org AS org_name FROM opportunities o JOIN users u ON u.id=o.organizer_id
             WHERE o.status='open' AND o.date >= date('now')`;
  const params = [];
  if (cause && cause !== "All") { sql += " AND o.cause=?"; params.push(cause); }
  if (q) { sql += " AND (o.title LIKE ? OR o.description LIKE ?)"; params.push(`%${q}%`, `%${q}%`); }
  sql += " ORDER BY o.date ASC";
  res.json({ opportunities: db.prepare(sql).all(...params) });
});

app.get("/api/opportunities/mine", auth(true, "organizer"), (req, res) => {
  const rows = db.prepare(`SELECT o.*, (SELECT COUNT(*) FROM signups s WHERE s.opportunity_id=o.id) AS signups
                           FROM opportunities o WHERE o.organizer_id=? ORDER BY o.date ASC`).all(req.user.id);
  res.json({ opportunities: rows });
});

app.post("/api/opportunities", auth(true, "organizer"), (req, res) => {
  const { title, description, cause, emoji, date, location, hours, slots } = req.body || {};
  if (!title || !cause || !date || !location || !slots) return res.status(400).json({ error: "Missing fields" });
  const info = db.prepare(`INSERT INTO opportunities (organizer_id,title,description,cause,emoji,date,location,hours,slots,slots_left)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(req.user.id, title, description || "", cause, emoji || "🤝", date, location, hours || 3, slots, slots);
  res.json({ opportunity: db.prepare("SELECT * FROM opportunities WHERE id=?").get(info.lastInsertRowid) });
});

app.delete("/api/opportunities/:id", auth(true, "organizer"), (req, res) => {
  const o = db.prepare("SELECT * FROM opportunities WHERE id=?").get(req.params.id);
  if (!o || o.organizer_id !== req.user.id) return res.status(404).json({ error: "Not found" });
  db.prepare("DELETE FROM signups WHERE opportunity_id=?").run(o.id);
  db.prepare("DELETE FROM opportunities WHERE id=?").run(o.id);
  res.json({ ok: true });
});

// ---------- signups ----------
app.post("/api/signups", auth(true, "volunteer"), (req, res) => {
  const o = db.prepare("SELECT * FROM opportunities WHERE id=?").get(req.body.opportunity_id);
  if (!o || o.status !== "open") return res.status(404).json({ error: "Opportunity unavailable" });
  if (o.slots_left < 1) return res.status(400).json({ error: "Fully booked" });
  if (db.prepare("SELECT id FROM signups WHERE opportunity_id=? AND volunteer_id=?").get(o.id, req.user.id))
    return res.status(409).json({ error: "Already signed up" });
  const tx = db.transaction(() => {
    db.prepare("UPDATE opportunities SET slots_left=slots_left-1 WHERE id=?").run(o.id);
    db.prepare("INSERT INTO signups (opportunity_id,volunteer_id) VALUES (?,?)").run(o.id, req.user.id);
  });
  tx();
  res.json({ ok: true });
});

app.get("/api/signups/mine", auth(true, "volunteer"), (req, res) => {
  const rows = db.prepare(`SELECT s.*, o.title, o.emoji, o.cause, o.date, o.location, o.hours, u.org AS org_name
    FROM signups s JOIN opportunities o ON o.id=s.opportunity_id JOIN users u ON u.id=o.organizer_id
    WHERE s.volunteer_id=? ORDER BY o.date ASC`).all(req.user.id);
  res.json({ signups: rows });
});

app.patch("/api/signups/:id/log", auth(true, "volunteer"), (req, res) => {
  const s = db.prepare("SELECT s.*, o.hours FROM signups s JOIN opportunities o ON o.id=s.opportunity_id WHERE s.id=?").get(req.params.id);
  if (!s || s.volunteer_id !== req.user.id) return res.status(404).json({ error: "Not found" });
  db.prepare("UPDATE signups SET status='completed', hours_logged=? WHERE id=?").run(s.hours, s.id);
  res.json({ ok: true });
});

// ---------- stats ----------
app.get("/api/stats", (req, res) => {
  res.json({
    volunteers: db.prepare("SELECT COUNT(*) AS n FROM users WHERE role='volunteer'").get().n,
    orgs: db.prepare("SELECT COUNT(*) AS n FROM users WHERE role='organizer'").get().n,
    hours: db.prepare("SELECT COALESCE(SUM(hours_logged),0) AS h FROM signups").get().h,
    opportunities: db.prepare("SELECT COUNT(*) AS n FROM opportunities").get().n,
  });
});

app.get("/api/health", (req, res) => res.json({ ok: true, service: "volunteermy", time: new Date().toISOString() }));
app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use(errorHandler);
app.listen(PORT, () => console.log(`🤝 VolunteerMy API on http://localhost:${PORT}`));
