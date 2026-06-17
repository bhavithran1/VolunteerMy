# 🤝 VolunteerMy — Volunteer Matching & Impact Tracking

Match willing hands with environmental and community causes across Malaysia — and track the hours and impact that follow.

## Stack
- **Frontend:** React + Vite + Framer Motion (scroll-driven animations)
- **Backend:** Node/Express + SQLite (`better-sqlite3`)
- **Auth:** email/password with bcrypt + JWT, two roles (`volunteer`, `organizer`)

## Run it
```bash
cd server && npm install && npm start    # http://localhost:4003
cd client && npm install && npm run dev   # http://localhost:5177
```
Vite proxies `/api` → `localhost:4003`. Demo seeds on first run.

### Demo accounts (password: `password123`)
| Email | Role |
|-------|------|
| `arif@demo.com` | volunteer |
| `siti@reefcare.org` | organiser (ReefCare Malaysia) |
| `daniel@treesfor.my` | organiser (Trees for Tomorrow) |

## Features
- Browse vetted opportunities, filter by cause + search
- One-tap sign-up with live spot counts (decrements stock)
- Volunteer dashboard: hours contributed, causes supported, log hours after events
- Organiser dashboard: post / delete opportunities, see sign-up counts
- Scroll-driven landing with count-up impact stats
