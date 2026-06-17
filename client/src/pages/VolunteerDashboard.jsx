import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Reveal, { Stagger, StaggerItem } from "../components/Reveal.jsx";

const fmtDate = (iso) => new Date(iso + "T00:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api("/signups/mine").then((d) => setSignups(d.signups)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const logHours = async (s) => { await api(`/signups/${s.id}/log`, { method: "PATCH" }); load(); };

  const hours = signups.reduce((acc, s) => acc + (s.hours_logged || 0), 0);
  const causes = new Set(signups.map((s) => s.cause)).size;
  const completed = signups.filter((s) => s.status === "completed").length;

  return (
    <div className="section">
      <div className="container">
        <Reveal><span className="eyebrow">Your dashboard</span></Reveal>
        <Reveal delay={0.05} as="h2">Hi {user?.name?.split(" ")[0]} 👋</Reveal>

        <Stagger className="grid grid-3 mt-40">
          {[
            { num: hours, label: "hours contributed" },
            { num: completed, label: "events completed" },
            { num: causes, label: "causes supported" },
          ].map((s) => (
            <StaggerItem key={s.label} className="card"><div style={{ padding: 28 }}><div className="stat-num">{s.num}</div><p className="muted mt-8">{s.label}</p></div></StaggerItem>
          ))}
        </Stagger>

        <h3 className="mt-40" style={{ fontSize: "1.4rem" }}>Your sign-ups</h3>
        {loading ? <p className="muted mt-16">Loading…</p>
          : signups.length === 0 ? (
            <div className="card mt-16" style={{ padding: 28 }}>
              <p className="muted">You haven't joined anything yet.</p>
              <Link to="/opportunities" className="btn btn-primary mt-16">Browse opportunities</Link>
            </div>
          ) : (
            <div className="grid mt-16">
              {signups.map((s) => (
                <div key={s.id} className="card flex between items-center" style={{ padding: "18px 22px", flexWrap: "wrap", gap: 12 }}>
                  <div className="flex items-center gap-12">
                    <span style={{ fontSize: "2rem" }}>{s.emoji}</span>
                    <div>
                      <strong>{s.title}</strong>
                      <div className="muted" style={{ fontSize: "0.86rem" }}>{s.org_name} · 📅 {fmtDate(s.date)} · 📍 {s.location}</div>
                    </div>
                  </div>
                  {s.status === "completed"
                    ? <span className="pill">✓ {s.hours_logged}h logged</span>
                    : <button className="btn btn-ghost" onClick={() => logHours(s)}>Log {s.hours}h</button>}
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
