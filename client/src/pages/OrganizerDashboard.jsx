import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Reveal, { Stagger, StaggerItem } from "../components/Reveal.jsx";

const EMPTY = { title: "", description: "", cause: "Environment", emoji: "🤝", date: "", location: "", hours: 3, slots: 20 };
const EMOJIS = ["🤝", "🌳", "🏖️", "🪸", "🌱", "📚", "🧹", "🐢", "💧", "☀️"];
const CAUSES = ["Environment", "Conservation", "Community", "Education"];
const fmtDate = (iso) => new Date(iso + "T00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" });

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api("/opportunities/mine").then((d) => setItems(d.opportunities));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const create = async (e) => {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      await api("/opportunities", { method: "POST", body: { ...form, hours: Number(form.hours), slots: Number(form.slots) } });
      setForm(EMPTY); load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const remove = async (o) => { if (confirm(`Delete “${o.title}”?`)) { await api(`/opportunities/${o.id}`, { method: "DELETE" }); load(); } };

  const totalSignups = items.reduce((s, o) => s + (o.signups || 0), 0);

  return (
    <div className="section">
      <div className="container">
        <Reveal><span className="eyebrow">Organiser dashboard</span></Reveal>
        <Reveal delay={0.05} as="h2">{user?.org || user?.name}</Reveal>

        <Stagger className="grid grid-3 mt-40">
          {[
            { num: items.length, label: "opportunities posted" },
            { num: totalSignups, label: "volunteers signed up" },
            { num: items.reduce((s, o) => s + o.slots, 0), label: "total spots offered" },
          ].map((s) => (
            <StaggerItem key={s.label} className="card"><div style={{ padding: 28 }}><div className="stat-num">{s.num}</div><p className="muted mt-8">{s.label}</p></div></StaggerItem>
          ))}
        </Stagger>

        <div className="grid grid-2 mt-40" style={{ alignItems: "start" }}>
          <Reveal className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: "1.3rem" }}>Post an opportunity</h3>
            <form onSubmit={create} className="mt-16">
              <div className="field"><label>Title</label><input className="input" value={form.title} onChange={set("title")} required placeholder="Coastal Cleanup — Port Dickson" /></div>
              <div className="field"><label>Description</label><textarea className="textarea" value={form.description} onChange={set("description")} placeholder="What volunteers will do…" /></div>
              <div className="grid grid-2" style={{ gap: 12 }}>
                <div className="field"><label>Cause</label><select className="select" value={form.cause} onChange={set("cause")}>{CAUSES.map((c) => <option key={c}>{c}</option>)}</select></div>
                <div className="field"><label>Date</label><input className="input" type="date" value={form.date} onChange={set("date")} required /></div>
              </div>
              <div className="field"><label>Icon</label>
                <div className="flex gap-12" style={{ flexWrap: "wrap" }}>
                  {EMOJIS.map((em) => (
                    <button type="button" key={em} onClick={() => setForm({ ...form, emoji: em })}
                      className="card" style={{ width: 44, height: 44, fontSize: "1.4rem", border: form.emoji === em ? "2px solid var(--green)" : "1px solid var(--line)", boxShadow: "none" }}>{em}</button>
                  ))}
                </div>
              </div>
              <div className="field"><label>Location</label><input className="input" value={form.location} onChange={set("location")} required placeholder="Teluk Kemang, Port Dickson" /></div>
              <div className="grid grid-2" style={{ gap: 12 }}>
                <div className="field"><label>Hours</label><input className="input" type="number" min="1" step="0.5" value={form.hours} onChange={set("hours")} required /></div>
                <div className="field"><label>Spots</label><input className="input" type="number" min="1" value={form.slots} onChange={set("slots")} required /></div>
              </div>
              {error && <div className="banner banner-error" style={{ marginBottom: 14 }}>{error}</div>}
              <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Posting…" : "Publish opportunity"}</button>
            </form>
          </Reveal>

          <div>
            <h3 style={{ fontSize: "1.3rem" }}>Your opportunities</h3>
            {items.length === 0 ? <p className="muted mt-16">Nothing posted yet.</p> : (
              <div className="grid mt-16">
                {items.map((o) => (
                  <div key={o.id} className="card" style={{ padding: "16px 20px" }}>
                    <div className="flex between items-center" style={{ gap: 12 }}>
                      <div className="flex items-center gap-12">
                        <span style={{ fontSize: "1.8rem" }}>{o.emoji}</span>
                        <div>
                          <strong>{o.title}</strong>
                          <div className="muted" style={{ fontSize: "0.84rem" }}>📅 {fmtDate(o.date)} · {o.signups || 0}/{o.slots} signed up · {o.slots_left} left</div>
                        </div>
                      </div>
                      <button className="btn btn-ghost" style={{ padding: "8px 14px" }} onClick={() => remove(o)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
