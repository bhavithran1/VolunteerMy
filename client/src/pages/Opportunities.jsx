import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import useDocumentTitle from "../lib/useDocumentTitle.js";
import OppoCard from "../components/OppoCard.jsx";
import { SkeletonGrid } from "../components/Skeleton.jsx";
import Reveal, { Stagger, StaggerItem } from "../components/Reveal.jsx";

const CAUSES = ["All", "Environment", "Conservation", "Community", "Education"];

export default function Opportunities() {
  useDocumentTitle("Opportunities", "Vetted environmental and community volunteer events across Malaysia.");
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [cause, setCause] = useState("All");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [doneIds, setDoneIds] = useState([]);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (cause !== "All") p.set("cause", cause);
    if (q) p.set("q", q);
    api(`/opportunities?${p}`).then((d) => setItems(d.opportunities)).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, [cause]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [q]);

  const signup = async (o) => {
    if (!user) return navigate("/login?mode=register&role=volunteer");
    if (user.role !== "volunteer") { toast.error("Sign up as a volunteer to join events."); return; }
    setBusyId(o.id);
    try {
      await api("/signups", { method: "POST", body: { opportunity_id: o.id } });
      setDoneIds([...doneIds, o.id]);
      toast.success(`You're in for “${o.title}” 🎉`);
      load();
    } catch (e) { toast.error(e.message); }
    finally { setBusyId(null); }
  };

  return (
    <div className="section">
      <div className="container">
        <Reveal><span className="eyebrow">Opportunities</span></Reveal>
        <Reveal delay={0.05} as="h2">Find your next way to help</Reveal>
        <Reveal delay={0.1}><p className="lead mt-16">Vetted environmental and community events across Malaysia.</p></Reveal>

        <Reveal delay={0.14}>
          <div className="flex gap-12 mt-24 items-center" style={{ flexWrap: "wrap" }}>
            <input className="input" style={{ maxWidth: 280 }} placeholder="Search events…" value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="flex gap-12" style={{ flexWrap: "wrap" }}>
              {CAUSES.map((c) => <button key={c} className={`btn ${cause === c ? "btn-primary" : "btn-ghost"}`} onClick={() => setCause(c)}>{c}</button>)}
            </div>
          </div>
        </Reveal>

        {loading ? <SkeletonGrid count={6} />
          : items.length === 0 ? (
            <div className="empty-state card mt-40">
              <div className="emoji">🧭</div>
              <h3 className="mt-16">No opportunities match</h3>
              <p className="muted mt-8">Try a different cause or clear your search — new events are posted regularly.</p>
            </div>
          ) : (
            <Stagger className="grid grid-3 mt-40">
              {items.map((o) => (
                <StaggerItem key={o.id}>
                  <OppoCard o={o} onSignup={signup} busy={busyId === o.id} done={doneIds.includes(o.id)} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
      </div>
    </div>
  );
}
