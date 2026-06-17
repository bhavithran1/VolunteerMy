import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import Counter from "../components/Counter.jsx";
import useDocumentTitle from "../lib/useDocumentTitle.js";
import { api } from "../lib/api.js";

const SHIFTS = [
  { time: "Sat 8:30", title: "River bank audit", place: "Klang", spots: "12 slots" },
  { time: "Sun 10:00", title: "Tree nursery prep", place: "Shah Alam", spots: "6 slots" },
  { time: "Wed 17:45", title: "Community food route", place: "PJ", spots: "4 slots" },
];

const SIGNALS = ["Skills matched", "Verified hosts", "Impact logged", "Gentle reminders"];

const STEPS = [
  { title: "Match", text: "See causes that fit the hours, skills and distance you actually have." },
  { title: "Commit", text: "Reserve a spot, get a clean brief and know exactly who is expecting you." },
  { title: "Report", text: "After the shift, hours and outcomes roll into one useful impact record." },
];

export default function Landing() {
  useDocumentTitle(
    "Match. Show up. Make impact.",
    "Match with environmental and community causes that fit your skills and schedule, then track your impact.",
  );

  const heroRef = useRef(null);
  const storyRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const { scrollYProgress: storyProgress } = useScroll({ target: storyRef, offset: ["start 70%", "end 35%"] });
  const heroLift = useTransform(heroProgress, [0, 1], [0, -54]);
  const boardDrift = useTransform(heroProgress, [0, 1], [0, 42]);
  const heroOpacity = useTransform(heroProgress, [0, 0.82], [1, 0.25]);
  const railScale = useTransform(storyProgress, [0, 1], [0.08, 1]);
  const [stats, setStats] = useState({ volunteers: 0, orgs: 0, hours: 0, opportunities: 0 });

  useEffect(() => {
    api("/stats").then(setStats).catch(() => {});
  }, []);

  return (
    <div className="vm-page">
      <section ref={heroRef} className="vm-hero">
        <motion.div className="vm-hero-backdrop" style={{ y: boardDrift }} aria-hidden="true">
          <div className="vm-board">
            <div className="vm-board-head">
              <span>Open this week</span>
              <strong>{stats.opportunities || 18}</strong>
            </div>
            {SHIFTS.map((shift) => (
              <div className="vm-shift" key={shift.title}>
                <span>{shift.time}</span>
                <div>
                  <strong>{shift.title}</strong>
                  <small>{shift.place} / {shift.spots}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="vm-lane vm-lane-one" />
          <div className="vm-lane vm-lane-two" />
        </motion.div>

        <div className="container vm-hero-content">
          <motion.div className="vm-hero-copy" style={{ y: heroLift, opacity: heroOpacity }}>
            <Reveal><span className="eyebrow">VolunteerMy</span></Reveal>
            <Reveal delay={0.08} as="h1">A calmer way to find the hours where you can help.</Reveal>
            <Reveal delay={0.16}>
              <p className="lead mt-16">
                VolunteerMy turns scattered calls for help into clear, local shifts with the details,
                reminders and impact tracking that make showing up easier.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="flex gap-12 mt-24 vm-actions">
                <Link to="/opportunities" className="btn btn-primary">Find a shift</Link>
                <Link to="/login?mode=register&role=organizer" className="btn btn-ghost">Post an opportunity</Link>
              </div>
            </Reveal>
          </motion.div>
        </div>
      </section>

      <section className="section vm-signal-section">
        <div className="container vm-signal-grid">
          {SIGNALS.map((signal, index) => (
            <Reveal key={signal} delay={index * 0.06} className="vm-signal">
              <span>0{index + 1}</span>
              <strong>{signal}</strong>
            </Reveal>
          ))}
        </div>
      </section>

      <section ref={storyRef} className="section vm-story">
        <div className="container vm-story-grid">
          <div>
            <Reveal><span className="eyebrow">How it moves</span></Reveal>
            <Reveal delay={0.05} as="h2">From intention to a real name on the list.</Reveal>
          </div>
          <div className="vm-timeline">
            <motion.div className="vm-timeline-rail" style={{ scaleY: railScale }} />
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.08} className="vm-step">
                <span>{step.title}</span>
                <p>{step.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section vm-impact">
        <div className="container">
          <Reveal><span className="eyebrow">Field notes</span></Reveal>
          <Reveal delay={0.05} as="h2">The small commitments become visible.</Reveal>
          <div className="vm-impact-grid mt-40">
            {[
              { to: stats.volunteers, label: "active volunteers" },
              { to: stats.hours, label: "hours contributed" },
              { to: stats.orgs, label: "partner organisations" },
            ].map((item, index) => (
              <Reveal key={item.label} delay={index * 0.08} className="vm-metric">
                <span className="stat-num"><Counter to={item.to} /></span>
                <p>{item.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section vm-cta">
        <div className="container center">
          <Reveal as="h2">Make the next open slot yours.</Reveal>
          <Reveal delay={0.08}>
            <p className="lead mt-16">Join as a volunteer or bring your organisation's next field day onto one clean board.</p>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="flex gap-12 mt-24 vm-actions">
              <Link to="/login?mode=register&role=volunteer" className="btn btn-primary">Volunteer with us</Link>
              <Link to="/login?mode=register&role=organizer" className="btn btn-ghost">Register an organisation</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
