import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import Counter from "../components/Counter.jsx";
import useDocumentTitle from "../lib/useDocumentTitle.js";
import { api } from "../lib/api.js";

const STEPS = [
  { icon: "🧭", title: "Find your cause", text: "Browse vetted opportunities by cause, date and location — from beach cleanups to tree planting." },
  { icon: "✋", title: "Sign up in a tap", text: "Reserve your spot instantly. Organisers see who's coming; you get the details that matter." },
  { icon: "📈", title: "Track your impact", text: "Log your hours after each event and watch your contribution to the planet add up." },
];
const CAUSES = ["🌳 Environment", "🏖️ Conservation", "🌱 Community", "📚 Education"];

export default function Landing() {
  useDocumentTitle("Match. Show up. Make impact.", "Match with environmental and community causes that fit your skills and schedule, then track your impact.");
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [stats, setStats] = useState({ volunteers: 0, orgs: 0, hours: 0, opportunities: 0 });
  useEffect(() => { api("/stats").then(setStats).catch(() => {}); }, []);

  return (
    <div>
      <section ref={heroRef} className="section" style={{ paddingTop: 90, paddingBottom: 80, overflow: "hidden" }}>
        <div className="container">
          <motion.div style={{ y, opacity }}>
            <Reveal><span className="pill">🤝 Malaysia's volunteer network</span></Reveal>
            <Reveal delay={0.08} as="h1" className="mt-16">Give a few hours.<br />Move the planet forward.</Reveal>
            <Reveal delay={0.16}><p className="lead mt-16">VolunteerMy matches you with environmental and community causes that fit your skills and schedule — then tracks the difference you make.</p></Reveal>
            <Reveal delay={0.24}>
              <div className="flex gap-12 mt-24" style={{ flexWrap: "wrap" }}>
                <Link to="/opportunities" className="btn btn-primary">Find opportunities</Link>
                <Link to="/login?mode=register&role=organizer" className="btn btn-ghost">Post an opportunity →</Link>
              </div>
            </Reveal>
          </motion.div>
          <Reveal delay={0.3}>
            <div className="flex gap-12 mt-40" style={{ flexWrap: "wrap" }}>
              {CAUSES.map((c, i) => (
                <motion.div key={c} className="card" style={{ padding: "16px 22px", fontWeight: 600 }}
                  animate={{ y: [0, -8, 0] }} transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}>{c}</motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ background: "var(--bg-soft)" }}>
        <div className="container">
          <Reveal><span className="eyebrow">Why it matters</span></Reveal>
          <Reveal delay={0.05} as="h2">Good intentions, finally easy to act on.</Reveal>
          <Reveal delay={0.1}><p className="lead mt-16">People want to help, but finding trustworthy local opportunities is hard. VolunteerMy removes the friction between willing hands and the causes that need them.</p></Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal><span className="eyebrow">How it works</span></Reveal>
          <Reveal delay={0.05} as="h2">From scrolling to showing up.</Reveal>
          <div className="grid grid-3 mt-40">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.12} className="card">
                <div style={{ padding: 30 }}>
                  <div style={{ fontSize: "2.4rem" }}>{s.icon}</div>
                  <h3 className="mt-16" style={{ fontSize: "1.35rem" }}>{s.title}</h3>
                  <p className="muted mt-8">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--green-deep)", color: "#fff" }}>
        <div className="container center">
          <Reveal><span className="eyebrow" style={{ color: "#f6c2b6" }}>Our movement</span></Reveal>
          <Reveal delay={0.05} as="h2">Hours add up to real change.</Reveal>
          <div className="grid grid-3 mt-40">
            {[
              { to: stats.volunteers, label: "active volunteers" },
              { to: stats.hours, label: "hours contributed", dec: 0 },
              { to: stats.orgs, label: "partner organisations" },
            ].map((c) => (
              <div key={c.label}>
                <span className="stat-num" style={{ color: "#fff" }}><Counter to={c.to} decimals={c.dec || 0} /></span>
                <p className="mt-8" style={{ color: "#f3d4cd" }}>{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container center">
          <Reveal as="h2">Your next good deed is one click away.</Reveal>
          <Reveal delay={0.08}><p className="lead mt-16" style={{ margin: "16px auto 0" }}>Join as a volunteer or rally your community as an organiser.</p></Reveal>
          <Reveal delay={0.16}>
            <div className="flex gap-12 mt-24" style={{ justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/login?mode=register&role=volunteer" className="btn btn-primary">Volunteer with us</Link>
              <Link to="/login?mode=register&role=organizer" className="btn btn-ghost">We're an organisation</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
