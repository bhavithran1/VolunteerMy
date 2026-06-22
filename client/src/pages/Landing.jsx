import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import Counter from "../components/Counter.jsx";
import useDocumentTitle from "../lib/useDocumentTitle.js";
import { api } from "../lib/api.js";

const MISSIONS = [
  { time: "08:30", title: "River audit", place: "Klang", role: "sorters + note-takers", lead: "Aina", fill: 72, urgency: "12 slots" },
  { time: "10:00", title: "Tree nursery", place: "Shah Alam", role: "soil prep + tagging", lead: "Harith", fill: 58, urgency: "6 slots" },
  { time: "17:45", title: "Food route", place: "PJ", role: "drivers + runners", lead: "Mei", fill: 86, urgency: "4 slots" },
];

const BOARD_LANES = [
  { label: "Recruit", count: 9, tasks: ["Roles unfilled", "New host checks", "Skill matching"] },
  { label: "Brief", count: 14, tasks: ["Arrival points", "Supply notes", "Weather flags"] },
  { label: "Field", count: 6, tasks: ["Live attendance", "Lead contact", "Transport gaps"] },
  { label: "Closeout", count: 11, tasks: ["Hours logged", "Outcome notes", "Follow-up tasks"] },
];

const TRUST_RAILS = [
  "Named on-site lead",
  "Supply list before signup",
  "Difficulty and weather flags",
  "Capacity by role, not vibes",
  "Attendance receipt after shift",
  "No-show history for organisers",
];

const ROUTES = [
  { cause: "Rivers", rhythm: "weekend mornings", roles: "audit, sort, haul-out" },
  { cause: "Food aid", rhythm: "weekday evenings", roles: "pack, drive, check-in" },
  { cause: "Urban green", rhythm: "small teams", roles: "plant, water, tag" },
  { cause: "Education", rhythm: "recurring blocks", roles: "mentor, setup, facilitate" },
];

const CLOSEOUT = [
  { label: "arrived", value: "31/34" },
  { label: "hours", value: "94" },
  { label: "kg audited", value: "420" },
  { label: "follow-ups", value: "6" },
];

export default function Landing() {
  useDocumentTitle(
    "Volunteer operations board",
    "A live board for staffing, briefing and closing volunteer shifts across Malaysia.",
  );

  const [stats, setStats] = useState({ volunteers: 0, orgs: 0, hours: 0, opportunities: 0 });

  useEffect(() => {
    api("/stats").then(setStats).catch(() => {});
  }, []);

  return (
    <div className="vm-page vm-overhaul">
      <section className="vm-command">
        <div className="container vm-command-grid">
          <Reveal className="vm-side-rail">
            <span className="vm-live-dot">Live board</span>
            <div>
              <strong>{stats.opportunities || 18}</strong>
              <p>open shifts this week</p>
            </div>
            <div>
              <strong>92%</strong>
              <p>brief completion</p>
            </div>
            <div>
              <strong>4.8</strong>
              <p>avg host rating</p>
            </div>
          </Reveal>

          <div className="vm-command-main">
            <Reveal><span className="eyebrow">VolunteerMy</span></Reveal>
            <Reveal delay={0.05} as="h1">A live ops board for people who show up.</Reveal>
            <Reveal delay={0.1}>
              <p className="lead mt-16">
                Staff roles, publish tight briefs, keep hosts accountable, and close every shift
                with hours and field notes that do not disappear into chat threads.
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <div className="flex gap-12 mt-24 vm-actions">
                <Link to="/opportunities" className="btn btn-primary">Open shift board</Link>
                <Link to="/login?mode=register&role=organizer" className="btn btn-ghost">Create host desk</Link>
              </div>
            </Reveal>

            <Reveal delay={0.18} className="vm-field-map" aria-label="Example volunteer shift map">
              <div className="vm-map-lines" aria-hidden="true">
                <i className="path-a" />
                <i className="path-b" />
                <span className="pin pin-a">Klang</span>
                <span className="pin pin-b">Shah Alam</span>
                <span className="pin pin-c">PJ</span>
              </div>
              <div className="vm-map-ledger">
                {MISSIONS.map((mission) => (
                  <div className="vm-ledger-row" key={mission.title}>
                    <time>{mission.time}</time>
                    <strong>{mission.title}</strong>
                    <span>{mission.place} / lead: {mission.lead}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="vm-roster">
            <div className="vm-roster-head">
              <span>Roster pressure</span>
              <strong>Today</strong>
            </div>
            {MISSIONS.map((mission) => (
              <article className="vm-mission-card" key={mission.title}>
                <div>
                  <strong>{mission.title}</strong>
                  <span>{mission.role}</span>
                </div>
                <em>{mission.urgency}</em>
                <i><b style={{ width: `${mission.fill}%` }} /></i>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section vm-board-section">
        <div className="container">
          <Reveal><span className="eyebrow">Workflow</span></Reveal>
          <Reveal delay={0.05} as="h2">The messy middle is the product.</Reveal>
          <div className="vm-kanban mt-40">
            {BOARD_LANES.map((lane, index) => (
              <Reveal key={lane.label} delay={index * 0.05} className="vm-lane-card">
                <div>
                  <span>{lane.label}</span>
                  <strong>{lane.count}</strong>
                </div>
                {lane.tasks.map((task) => <p key={task}>{task}</p>)}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section vm-safety-section">
        <div className="container vm-safety-grid">
          <div>
            <Reveal><span className="eyebrow">Readiness</span></Reveal>
            <Reveal delay={0.05} as="h2">Showing up should feel specific.</Reveal>
          </div>
          <Reveal delay={0.1} className="vm-chip-wall">
            {TRUST_RAILS.map((item) => <span key={item}>{item}</span>)}
          </Reveal>
        </div>
      </section>

      <section className="section vm-route-section">
        <div className="container">
          <Reveal><span className="eyebrow">Cause routing</span></Reveal>
          <Reveal delay={0.05} as="h2">Different work needs different volunteer rhythm.</Reveal>
          <div className="vm-route-table mt-40">
            {ROUTES.map((route) => (
              <Reveal key={route.cause} className="vm-route-row">
                <strong>{route.cause}</strong>
                <span>{route.roles}</span>
                <em>{route.rhythm}</em>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section vm-proof-section">
        <div className="container vm-proof-grid">
          <div>
            <Reveal><span className="eyebrow">Field record</span></Reveal>
            <Reveal delay={0.05} as="h2">The shift closes with a receipt.</Reveal>
            <Reveal delay={0.1}>
              <p className="lead mt-16">
                Volunteers keep their hours, organisers keep the outcome trail, and the next
                event starts with better information.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.12} className="vm-closeout">
            <div className="vm-closeout-head">
              <span>Klang river audit</span>
              <strong>Closed</strong>
            </div>
            {CLOSEOUT.map((item) => (
              <div className="vm-closeout-row" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section vm-impact-strip">
        <div className="container vm-impact-inline">
          {[
            { to: stats.volunteers, label: "active volunteers" },
            { to: stats.hours, label: "hours contributed" },
            { to: stats.orgs, label: "partner organisations" },
          ].map((item, index) => (
            <Reveal key={item.label} delay={index * 0.06} className="vm-inline-metric">
              <span className="stat-num"><Counter to={item.to} /></span>
              <p>{item.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section vm-cta">
        <div className="container center">
          <Reveal as="h2">Build the next shift like an operation.</Reveal>
          <Reveal delay={0.08}>
            <p className="lead mt-16">Open the board as a volunteer, or give your organisation a cleaner way to host field work.</p>
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
