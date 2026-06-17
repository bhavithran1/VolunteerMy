import { motion } from "framer-motion";

const fmtDate = (iso) => new Date(iso + "T00:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

export default function OppoCard({ o, onSignup, busy, done }) {
  return (
    <motion.div className="card oppo" whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
      <div className="oppo-body">
        <div className="flex between items-center">
          <span style={{ fontSize: "2.6rem" }}>{o.emoji}</span>
          <span className="cause">{o.cause}</span>
        </div>
        <strong style={{ fontSize: "1.15rem" }}>{o.title}</strong>
        <span className="muted" style={{ fontSize: "0.9rem" }}>{o.org_name}</span>
        <p className="muted" style={{ fontSize: "0.92rem" }}>{o.description}</p>
        <div className="muted" style={{ fontSize: "0.86rem" }}>
          📅 {fmtDate(o.date)} · ⏱️ {o.hours}h<br />📍 {o.location}
        </div>
        <div className="flex between items-center mt-8">
          <span className="pill">{o.slots_left} of {o.slots} spots left</span>
        </div>
        {onSignup && (
          <button className="btn btn-primary btn-block mt-8" disabled={busy || done || o.slots_left < 1}
            onClick={() => onSignup(o)}>
            {done ? "✓ Signed up" : o.slots_left < 1 ? "Fully booked" : busy ? "Joining…" : "Sign up"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
