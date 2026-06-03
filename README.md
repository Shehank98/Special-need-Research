# 📚 Read & Play — Bilingual Dyslexia Learning App

A bilingual (**Sinhala 🇱🇰 + English 🇬🇧**) web app that helps primary‑school
students (ages 6–12) with dyslexia in Sri Lanka. It uses gamified, dyslexia‑friendly
lessons and quietly collects learning‑engagement and performance data for a
2‑week academic research study (10–20 participants).

## ✨ Features

- **Bilingual UI** with a persistent Sinhala/English toggle (saved per user).
- **Dyslexia‑friendly design**: OpenDyslexic font, large text, high line/letter
  spacing, warm cream background (no pure white), large tap targets, no italics,
  justified text, or ALL CAPS.
- **Text‑to‑Speech** on every sentence via the browser‑native Web Speech API
  (English + Sinhala).
- **Real picture illustrations** via [OpenMoji](https://openmoji.org) (openly
  licensed, CC BY‑SA), rendered as crisp SVGs with an automatic emoji fallback —
  no asset hosting required.
- **Lesson types**: reading, picture‑match, and picture‑answer quizzes
  (15 bilingual lessons across difficulty levels 1–5 in the seed).
- **Adaptive difficulty**: < 60% → drop a level, > 85% → climb a level.
- **Gamification**: badges (First Lesson, 3‑Day Streak, Perfect Score, Speed Star,
  Helper) with a confetti unlock animation.
- **Teacher dashboard** with per‑student metrics and a **CSV export** for research.
- **Research metrics** captured automatically: time on task, completion rate,
  average score, TTS usage, hint usage, login streak, badge progression.

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT (teacher/student roles) |
| TTS | Web Speech API |
| Deploy | Railway (single service, NIXPACKS) |

## 📁 Structure

```
/
├── client/          React + Vite app
│   └── src/
│       ├── components/   shared UI (SpeakButton, BadgeCard, Confetti…)
│       ├── context/      Auth + Language providers
│       ├── hooks/        useTTS (Web Speech API)
│       └── pages/        Login, StudentDashboard, LessonPlayer, Quiz, Badges, TeacherDashboard
├── server/          Express API
│   ├── db/               pool, schema.sql, setup, seed
│   ├── middleware/       JWT auth + role guards
│   ├── routes/           auth, students, lessons, progress, events, badges, teacher
│   └── utils/            badge logic
├── package.json     root scripts (build/start/dev)
└── railway.json     Railway deploy config
```

## 🚀 Local Development

### 1. Prerequisites
- Node.js ≥ 20
- A PostgreSQL database (local or hosted). Set `DATABASE_URL`.

### 2. Configure environment
```bash
cp .env.example server/.env      # then edit values
cp client/.env.example client/.env
```
Minimum required in `server/.env`:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/dyslexia
JWT_SECRET=some_long_random_string
TEACHER_PASSWORD=teacher123
```

### 3. Install dependencies
```bash
npm install                 # root (concurrently)
npm run install:all         # installs client + server
```

### 4. Create tables and seed sample data
```bash
npm run db:setup            # create tables from schema.sql
npm run db:seed             # add sample lessons + demo users
```

**Prefer pure SQL?** The same content is available as plain SQL files you can run
with `psql` (no Node needed):
```bash
psql "$DATABASE_URL" -f server/db/schema.sql -f server/db/seed.sql
```
`server/db/seed.sql` is auto-generated from `server/db/lessons.data.js`
(`npm run db:gen-sql`), so it always matches the app's content. The seeded
teacher row has a `NULL` password until first login, where the invite code
(`TEACHER_PASSWORD`) bootstraps a bcrypt hash.

### 5. Run both apps
```bash
npm run dev                 # server on :3000, client on :5173 (Vite proxy)
```
Open http://localhost:5173.

**Demo logins**
- Student: any name (auto‑registers), e.g. `Nimal`.
- Teacher: name `Ms. Perera`, password `teacher123` (or your `TEACHER_PASSWORD`).

**Teacher accounts**
Teacher passwords are hashed with bcrypt. New teachers create their own account
from the login screen ("Create teacher account") using the **invite code**, which
is the `TEACHER_PASSWORD` environment variable. The seeded `Ms. Perera` account
uses that same value as its initial password.

## 🌐 API Routes

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Student/teacher login |
| POST | `/api/auth/register` | Create a teacher account (invite code) |
| POST | `/api/auth/logout` | Records logout time |
| GET | `/api/students/:id/dashboard` | Student dashboard data |
| GET | `/api/lessons` | List lessons (`?difficulty=`) |
| GET | `/api/lessons/:id` | Lesson content |
| POST | `/api/progress` | Save progress (adaptive + badges) |
| GET | `/api/progress/:studentId` | All progress for a student |
| POST | `/api/events` | Log engagement event |
| GET | `/api/badges/:studentId` | Earned badges |
| POST | `/api/badges` | Award a badge |
| GET | `/api/teacher/students` | List students |
| GET | `/api/teacher/report` | Research report (`?format=csv`) |
| POST | `/api/teacher/assign` | Assign a lesson to a student |
| GET | `/api/health` | Health check |

## 📊 Research Metrics

| Metric | Source |
|---|---|
| Time on task | `study_sessions` login/logout + `progress.time_spent_seconds` |
| Lesson completion rate | `progress.completed` |
| Average quiz score | `progress.score` |
| TTS usage | `engagement_events.event_type = 'tts_used'` |
| Hint usage | `engagement_events.event_type = 'hint_used'` |
| Daily login streak | distinct `study_sessions.session_date` |
| Badge progression | `badges` |

The teacher **CSV export** aggregates all of the above, one row per student.

## ☁️ Deploy to Railway

1. Create a Railway project and add the **PostgreSQL** plugin (provides
   `DATABASE_URL` automatically).
2. Deploy this repo. `railway.json` uses NIXPACKS; the root `build` script
   installs both apps and builds the client, and `npm start` runs the Express
   server, which also serves the built client (`client/dist`).
3. Set environment variables in the Railway dashboard:
   ```
   JWT_SECRET=<long random string>
   TEACHER_PASSWORD=<your password>
   NODE_ENV=production
   FRONTEND_URL=https://<your-app>.railway.app
   ```
4. After the first deploy, run the DB setup + seed once (Railway shell or locally
   against the same `DATABASE_URL`):
   ```bash
   npm run db:setup
   npm run db:seed
   ```

## 🔐 Production hardening

- **helmet** security headers incl. a Content‑Security‑Policy scoped to the app's
  CDNs (OpenDyslexic, Google Fonts, OpenMoji).
- **Rate limiting**: 600 req / 15 min globally, 50 / 15 min on `/api/auth` to slow
  brute‑force attempts.
- **bcrypt** password hashing for teacher accounts (cost 12).
- **Input validation** (express‑validator + bounds/whitelist checks) and a 100 kB
  JSON body limit on all routes.
- **CORS** locked to `FRONTEND_URL` in production; `trust proxy` set for Railway.

## 🔐 Notes on research ethics
- Student login is name‑based for young children in a supervised setting; collect
  data only with informed consent/assent per your study protocol.
- The optional leaderboard concept is intentionally left anonymized.

## License
For academic/research use.
