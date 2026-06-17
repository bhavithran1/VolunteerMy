import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "volunteermy.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('volunteer','organizer')),
    org TEXT,
    skills TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organizer_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    cause TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '🤝',
    date TEXT NOT NULL,
    location TEXT NOT NULL,
    hours REAL NOT NULL DEFAULT 3,
    slots INTEGER NOT NULL,
    slots_left INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id INTEGER NOT NULL REFERENCES opportunities(id),
    volunteer_id INTEGER NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'confirmed',
    hours_logged REAL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(opportunity_id, volunteer_id)
  );
`);

const seeded = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
if (seeded === 0) {
  const hash = (pw) => bcrypt.hashSync(pw, 10);
  const iu = db.prepare("INSERT INTO users (name,email,password_hash,role,org,skills) VALUES (?,?,?,?,?,?)");
  const reef = iu.run("Siti Aminah", "siti@reefcare.org", hash("password123"), "organizer", "ReefCare Malaysia", null);
  const trees = iu.run("Daniel Wong", "daniel@treesfor.my", hash("password123"), "organizer", "Trees for Tomorrow", null);
  iu.run("Arif Hakim", "arif@demo.com", hash("password123"), "volunteer", null, "Teaching, Logistics");

  const d = (off) => { const dt = new Date(); dt.setDate(dt.getDate() + off); return dt.toISOString().slice(0, 10); };
  const io = db.prepare(`INSERT INTO opportunities (organizer_id,title,description,cause,emoji,date,location,hours,slots,slots_left)
    VALUES (@organizer_id,@title,@description,@cause,@emoji,@date,@location,@hours,@slots,@slots)`);
  [
    { organizer_id: reef.lastInsertRowid, title: "Coastal Cleanup — Port Dickson", description: "Help remove plastic from the shoreline and sort recyclables. Gloves & bags provided.", cause: "Environment", emoji: "🏖️", date: d(5), location: "Teluk Kemang, Port Dickson", hours: 4, slots: 30 },
    { organizer_id: reef.lastInsertRowid, title: "Coral Nursery Maintenance", description: "Snorkel-assisted cleaning of coral nursery frames. Basic swimming required.", cause: "Environment", emoji: "🪸", date: d(12), location: "Pulau Tioman", hours: 6, slots: 12 },
    { organizer_id: trees.lastInsertRowid, title: "Urban Tree Planting Day", description: "Plant 200 native saplings along the river corridor with local schools.", cause: "Environment", emoji: "🌳", date: d(3), location: "Taman Tugu, KL", hours: 3, slots: 40 },
    { organizer_id: trees.lastInsertRowid, title: "Community Garden Build", description: "Build raised beds and compost bins for a low-income neighbourhood garden.", cause: "Community", emoji: "🌱", date: d(8), location: "Sentul, KL", hours: 5, slots: 20 },
  ].forEach((o) => io.run(o));
  console.log("✓ Seeded demo data (siti@reefcare.org / daniel@treesfor.my / arif@demo.com — password123)");
}

export default db;
