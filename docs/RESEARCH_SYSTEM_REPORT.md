# Read & Play — Complete System & Research Report

*A bilingual (Sinhala 🇱🇰 / English 🇬🇧) gamified learning platform for Grade-4
primary-school students with specific learning difficulties (dyslexia,
dyscalculia, dysorthographia), with a built-in two-group engagement study.*

> **Purpose of this document.** This is a single, self-contained reference for
> the research write-up. It describes *what* the system does, *how* it is built,
> *how marks and metrics are computed* (with exact formulas taken from the source
> code), *what data is captured*, and *how to export and analyse it*. An MSc
> researcher should be able to lift sections of this directly into a methodology /
> system-design chapter.

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [Research design](#2-research-design)
3. [Technology stack](#3-technology-stack)
4. [System architecture](#4-system-architecture)
5. [User roles & onboarding](#5-user-roles--onboarding)
6. [Learning content](#6-learning-content)
7. [How marks / scoring work (exact formulas)](#7-how-marks--scoring-work-exact-formulas)
8. [Adaptive difficulty, levels & stars](#8-adaptive-difficulty-levels--stars)
9. [Badges (gamification)](#9-badges-gamification)
10. [Engagement measurement model](#10-engagement-measurement-model)
11. [Per-question response-time analytics](#11-per-question-response-time-analytics)
12. [Teacher tools & the two-group workflow](#12-teacher-tools--the-two-group-workflow)
13. [Database schema (every table & column)](#13-database-schema-every-table--column)
14. [Complete API reference](#14-complete-api-reference)
15. [Data export & analysis guide](#15-data-export--analysis-guide)
16. [Security, privacy & ethics](#16-security-privacy--ethics)
17. [Deployment & setup](#17-deployment--setup)
18. [Limitations & threats to validity](#18-limitations--threats-to-validity)
19. [Dyscalculia-specific design & pre-mathematics support](#19-dyscalculia-specific-design--pre-mathematics-support)
20. [Glossary](#20-glossary)

---

## 1. Executive summary

**Read & Play** is a web application that teaches the Sri Lankan Grade-4
mathematics syllabus (and supporting literacy activities) through short,
gamified, accessibility-first interactive exercises. Every interaction is
designed for children with specific learning difficulties: the OpenDyslexic
font, large tap targets, a warm low-glare colour palette, text-to-speech on all
content, and picture-based answers.

Crucially, the platform is **also a research instrument**. It runs a controlled
**two-group study** comparing an **intervention** group (full gamified
experience: animations, badges, instant encouragement, guided letter tracing)
against a **control** group (the *same* lessons and the *same* measurement, but
a deliberately plain presentation: no game elements, no instant feedback). The
software silently records behavioural, emotional, and cognitive engagement
signals plus performance, and exposes them to teachers and researchers through
dashboards and CSV export.

The core research claim the platform is built to test:

> *Does a gamified, multisensory, encouragement-rich presentation increase the
> engagement and learning performance of Grade-4 students with learning
> difficulties, relative to the same content delivered plainly?*

---

## 2. Research design

### 2.1 Design type
- **Between-subjects, two-group comparison** (intervention vs. control).
- Both groups receive **identical learning content and identical measurement
  instruments** — only the *experience layer* differs. This is enforced in code
  (see `client/src/lib/experience.js`), so the manipulation cannot accidentally
  leak into the measurement.
- Intended scale (per the project brief): a small cohort of **10–20
  participants** over a **~2-week** study window.

### 2.2 Independent variable (the manipulation)
A single categorical factor, `study_group`, with two levels:

| Group | Experience flags (`experienceFor()`) | What the child sees |
|---|---|---|
| `intervention` | `gamified: true`, `instantFeedback: true`, `tracing: true` | Animated encouragement on every answer, badges/confetti, instant correct/try-again feedback, **guided** letter tracing with prompt-fading |
| `control` | `gamified: false`, `instantFeedback: false`, `tracing: false` | Same questions, but no game elements, **no** instant feedback, plain (unguided) writing |
| *(unassigned / legacy)* | `gamified: true`, `instantFeedback: true`, `tracing: false` | Rich experience but tracing off — used for demo accounts not yet placed in a group |

> **Why this matters for validity:** because the control group is a genuine
> "plain" condition, any difference observed between groups can be attributed to
> the gamification/feedback manipulation rather than to different content.

### 2.3 Dependent variables (what is measured)
Engagement is operationalised across **three dimensions** (a standard framework
in educational-engagement literature), each backed by concrete logged signals:

| Dimension | Operational signals in the system |
|---|---|
| **Behavioural** | time-on-task, attempts, completions, retries, lessons completed, login days / streak, session minutes |
| **Emotional** | self-reported **mood** at session start & end (1–5), teacher-rated **frustration** (1–5) |
| **Cognitive** | hint usage, **response time per question**, answer accuracy, self-correction, tracing accuracy, prompt-fading (guide-level) progression |

Performance (learning) outcomes:
- average quiz score, per-topic scores, stars earned, level progression,
  tracing accuracy.

### 2.4 Control / shared instruments (filled for **both** groups)
- **Mood check-in** (`MoodCheckIn.jsx`): identical 5-face scale at session start
  and end for every child, regardless of group → emotional-engagement measure.
- **Teacher rubric** (`teacher_ratings`): attention, participation, frustration
  (each 1–5) + free-text notes, recorded by the teacher for any student in
  either group → an observational triangulation of the self-report data.

---

## 3. Technology stack

| Layer | Technology | Version (from manifests) |
|---|---|---|
| **Frontend framework** | React | `^18.3.1` |
| **Routing** | react-router-dom | `^6.28.0` |
| **Build tool / dev server** | Vite | `^5.4.11` (`@vitejs/plugin-react ^4.3.4`) |
| **Styling** | Tailwind CSS | `^3.4.17` (+ PostCSS `^8.4.49`, Autoprefixer `^10.4.20`) |
| **Backend runtime** | Node.js (ES Modules) | ≥ 20 recommended |
| **Web framework** | Express | `^4.21.2` |
| **Database** | PostgreSQL | via `pg` `^8.13.1` |
| **Authentication** | JSON Web Tokens | `jsonwebtoken ^9.0.2` |
| **Password hashing** | bcryptjs | `^2.4.3` (cost factor 12) |
| **Security headers** | helmet | `^8.0.0` |
| **Rate limiting** | express-rate-limit | `^7.4.1` |
| **Input validation** | express-validator | `^7.2.0` |
| **Logging** | morgan | `^1.10.0` |
| **CORS** | cors | `^2.8.5` |
| **Config** | dotenv | `^16.4.5` |
| **Text-to-Speech** | Web Speech API (browser-native) | n/a |
| **Illustrations** | OpenMoji (CC BY-SA), rendered as SVG with emoji fallback | n/a |
| **Fonts** | OpenDyslexic + Noto Sans Sinhala | via CDN |
| **Hosting** | Railway (single service, NIXPACKS builder) | n/a |

**No heavy client dependencies.** The frontend deliberately avoids chart/animation
libraries — confetti, sparkles, and all animations are hand-written CSS
keyframes (`client/src/index.css`), keeping the bundle small (~100 kB gzipped)
for low-end devices and slow connections.

---

## 4. System architecture

```
┌──────────────────────────┐         HTTPS / JSON          ┌──────────────────────────┐
│   Browser (React + Vite) │  ───────────────────────────▶ │   Express API (Node.js)  │
│                          │     Bearer JWT in header       │                          │
│  • Student activities    │ ◀───────────────────────────  │  • Auth + role guards    │
│  • Teacher dashboards    │                                │  • Validation + limits   │
│  • Web Speech API (TTS)  │                                │  • Business logic        │
└──────────────────────────┘                                └────────────┬─────────────┘
                                                                          │ SQL (pg Pool)
                                                                          ▼
                                                             ┌──────────────────────────┐
                                                             │      PostgreSQL          │
                                                             │  users, lessons,         │
                                                             │  progress, sessions,     │
                                                             │  engagement_events,      │
                                                             │  badges, teacher_ratings,│
                                                             │  tracing_attempts,       │
                                                             │  question_responses      │
                                                             └──────────────────────────┘
```

- **Single-service deployment.** In production the Express server also serves the
  built React app (`client/dist`), so there is one origin and no CORS in the
  common case (`server/index.js`).
- **Stateless API.** Authentication is a signed JWT (30-day expiry) carried in
  the `Authorization: Bearer` header; there are no server sessions.
- **Idempotent schema.** `schema.sql` uses `CREATE … IF NOT EXISTS` / `ALTER …
  ADD COLUMN IF NOT EXISTS` throughout and can be re-run safely. Optionally it is
  applied automatically on server boot (`RUN_MIGRATIONS` ≠ `false`).

### 4.1 Repository layout
```
/
├── client/                      React + Vite app
│   └── src/
│       ├── components/          Shared UI (SpeakButton, Confetti, Encouragement,
│       │                        MoodCheckIn, TracingCanvas, ProgressBar, Layout…)
│       ├── context/             AuthContext (JWT/user), LanguageContext (en/si)
│       ├── hooks/               useTTS (Web Speech API wrapper)
│       ├── lib/                 experience.js, encouragement.js, groups.js,
│       │                        mathSyllabus.js, mathLevels.js, mathGenerators.js,
│       │                        mathTeach.js, lessons.js, openmoji.js
│       └── pages/               Login, MathHome, MathModule, MathActivity, Quiz,
│                                SpellingGame, NumberGame, WritingActivity, Badges,
│                                StudentDashboard, TeacherDashboard, GroupSelect,
│                                GroupStudents, StudentDetail, LessonManager,
│                                + pages/math/* (each interactive activity)
├── server/                      Express API
│   ├── db/                      pool.js, schema.sql, setup.js, seed.js,
│   │                            lessons.data.js, migrate.js, seed.sql
│   ├── middleware/              auth.js (JWT verify + role guards)
│   ├── migrations/              001_research.sql (+ rollback)
│   ├── routes/                  auth, students, lessons, progress, events,
│   │                            badges, teacher, sessions, tracing, math, responses
│   └── utils/                   badges.js (badge rules)
├── docs/                        this report
└── railway.json                 deploy config
```

---

## 5. User roles & onboarding

### 5.1 Roles
- **Student** — plays activities; can only read/write *their own* data.
- **Teacher** — manages lessons, views all students, assigns research groups,
  rates students, exports data. Protected by a hashed password.

Role enforcement lives in `server/middleware/auth.js`:
- `requireAuth` — verifies the JWT.
- `requireRole('teacher')` — teacher-only endpoints.
- `requireSelfOrTeacher(param)` — a student may only touch their own records; a
  teacher may touch anyone's.

### 5.2 Student login (two modes)
1. **Anonymous research code** (`anon_code`): the recommended mode for the study.
   Participants are pre-created with a code (and `age`, `difficulty_type`,
   `study_group`) but **no name**, so the dataset is de-identified. Login is by
   code only.
2. **Name-based auto-create** (legacy/demo): typing a name logs in or silently
   creates a student. Convenient for classroom demos.

On **every** student login the server:
- computes the **`week_number`** (1-based, from the student's first-ever login:
  `floor(daysSinceFirstLogin / 7) + 1`),
- opens a **study session** row (`study_sessions`) stamped with the date,
  login time, week number, and the student's `study_group`,
- returns a JWT, the public user object, and the session (which the client keeps
  in `localStorage` to stamp later events).

### 5.3 Teacher accounts
- Created from the login screen with an **invite code** (the `TEACHER_PASSWORD`
  env var). Passwords are bcrypt-hashed (cost 12).
- A seeded demo teacher `Ms. Perera` exists; its password is bootstrapped from
  the invite code on first login.

---

## 6. Learning content

### 6.1 Two content systems
The platform contains **two complementary content engines**:

**(a) Database-driven lessons** (`lessons` table, authored via the Teacher
"Lesson Manager"). Five validated lesson types (`server/routes/lessons.js`):

| Type | Structure | Default disability category |
|---|---|---|
| `reading` | `content.sentences[]` (en/si) | dyslexia |
| `quiz` | `content.questions[]` each with ≥2 picture options, ≥1 correct | dyslexia |
| `picture_match` | `content.items[]` each with `word_en`/`word_si` | dyslexia |
| `numbers` | `content.questions[]` with object groups + numeric answer + options | dyscalculia |
| `spelling` | `content.items[]` each with an English word (2+ letters) | dysorthographia |

Each lesson has a **difficulty 1–5** and a **category** (`dyslexia`,
`dyscalculia`, `dysorthographia`) used for per-disability reporting.

**(b) Code-driven Grade-4 maths activities** (`client/src/lib/mathSyllabus.js`
and `client/src/lib/mathGenerators.js`). These are the primary student
experience. The syllabus is organised into **8 modules → topics → interactive
activities**:

| Module | Example topics / activities |
|---|---|
| 🌱 Number Foundations | **readiness check**, count the objects, find the number, number words, more/fewer, before & after, maths signs *(Dyscalculia pre-mathematics — see §19)* |
| 🔢 Numbers | read & write numbers, place value, ordering, patterns, multiples, fractions, Roman numerals |
| ➕ Arithmetic | addition (carrying), subtraction (borrowing), times tables, division |
| 📏 Measurement | telling time, set the clock, capacity, length, weight, area |
| 💰 Money | notes & coins, money calculations, virtual shop, bills & receipts |
| 🔷 Geometry | 2D/3D shapes, faces/edges/corners, right angles, directions |
| 📊 Data handling | read tables, bar charts, picture graphs |
| 📝 Assessment | mixed quiz, end-of-unit test |

Two kinds of maths activity exist:
- **Bespoke interactives** (e.g. `Clock`, `Shop`, `Fractions`, `Addition`)
  registered in `MathActivity.jsx`.
- **Generated MCQ activities** driven by `mathGenerators.js` through the shared
  `QuizGame.jsx` engine. Each generator takes a difficulty `level` (1–3) and
  returns a question `{ prompt_en, prompt_si, visual?, options[] }`, producing
  effectively unlimited randomised practice with **difficulty-scaled
  distractors** (e.g. harder levels put the wrong answers numerically closer to
  the right one).

### 6.2 Activity flow
`MathActivity.jsx` runs a **learn → choose level → play** flow:
1. **Learn** — an optional teaching intro (`TEACH` steps) explains the concept.
2. **Level select** — choose Easy (1) / Medium (2) / Hard (3); higher levels
   unlock as the student passes.
3. **Play** — a round of (default) **6 questions**, then a results screen.

### 6.3 Accessibility features (apply to both groups)
- **OpenDyslexic** font + Noto Sans Sinhala; base font size 1.2 rem; generous
  line/letter/word spacing; no italics, no justified text, no ALL-CAPS body.
- **Warm cream background** (`#fdf6e3`), never pure white (reduces glare).
- **Large tap targets** (min 56 px), big focus rings for keyboard users.
- **Text-to-Speech** on all prompts via the Web Speech API (`useTTS.js`),
  English `en-US` or Sinhala `si-LK`, slowed to rate 0.85 for young readers.
- **Picture answers** via OpenMoji SVGs with emoji fallback.
- **`prefers-reduced-motion`** is honoured — all decorative animations disable
  for sensitive users.

---

## 7. How marks / scoring work (exact formulas)

This is the most important section for the methodology chapter. Every formula
below is taken verbatim from the source.

### 7.1 Reading / picture quiz score (`client/src/pages/Quiz.jsx`)
For a quiz of `N` questions where the child answered `C` correctly and used `H`
hints:
```
base  = round( (C / N) * 100 )
score = max( 0, base − (H * 5) )          // each hint costs 5 points
```
- Time on task = wall-clock seconds from quiz start to finish.
- `used_hint` = `true` if `H > 0`.
- The result is POSTed to `/api/progress` with `completed: true`.

### 7.2 Maths activity score (`QuizGame.jsx` → `MathResult.jsx`)
For a round of `rounds` questions (default **6**) with `correct` right:
```
score = round( (correct / rounds) * 100 )
```
- **No hint penalty** in the maths engine (maths activities have no hint button).
- `correct` and `total` are also stored for accuracy analysis.

### 7.3 Server-side persistence & clamping
**Maths results** (`server/routes/math.js`, `POST /api/math/result`):
- `level` clamped to **1–3**, `score` clamped to **0–100**, `time` clamped to
  **0–86 400 s**.
- A backing `lessons` row (type `math`, category `dyscalculia`) is lazily created
  per `(activity, level)` so maths flows into the same `progress` table.
- **Upsert rule:** one `progress` row per `(student, lesson)`. On a repeat
  attempt the stored `score` is **overwritten with the latest attempt**,
  `time_spent_seconds` **accumulates**, `attempts` increments, `completed_at` is
  refreshed.

**Generic progress** (`server/routes/progress.js`, `POST /api/progress`):
- `score` clamped 0–100, `time` clamped 0–86 400 s.
- Same upsert semantics (latest score wins; time accumulates; attempts increment).

> **Analysis note.** Because the stored `score` is the *latest* attempt, the
> teacher report's `avg_score` is the mean of each lesson's most-recent score.
> The *client* roadmap separately keeps the **best** score per level for star
> display (`useMathProgress` in `mathLevels.js`). Be explicit about which you use
> when reporting.

### 7.4 Tracing accuracy (`server/routes/tracing.js`, intervention only)
- `accuracy_pct` ∈ [0, 100] = how closely the child's stroke followed the dashed
  guide (computed client-side in `TracingCanvas.jsx`).
- Each attempt stores `time_ms`, `retries`, and `guide_level`.

---

## 8. Adaptive difficulty, levels & stars

### 8.1 Stars (`client/src/lib/mathLevels.js`)
```
score ≥ 95  → 3 stars
score ≥ 80  → 2 stars
score ≥ 70  → 1 star      (70 = PASS_SCORE)
score < 70  → 0 stars  (level not passed)
```
- Each activity has **3 levels × max 3 stars = 9 stars** maximum.
- A level **passes** at **≥ 70%**; passing **unlocks the next level**. Level 1 is
  always unlocked.

### 8.2 Adaptive next-lesson recommendation (`server/routes/progress.js`)
After a generic lesson the server recommends the next difficulty:
```
if score < 60 → nextDifficulty = max(1, current − 1)   // ease off
if score > 85 → nextDifficulty = min(5, current + 1)   // step up
else            nextDifficulty = current               // hold
```
It then suggests the first not-yet-completed lesson at that difficulty. This
implements a simple **performance-adaptive difficulty** loop.

### 8.3 Prompt fading in tracing (`server/routes/tracing.js`, intervention only)
A scaffolding-withdrawal mechanism. `guide_level` 1 = full dashes; higher =
fewer dashes (less support). The recommended level rises when the child is
consistently accurate:
```
FADE_ACCURACY     = 80     // % accuracy threshold
FADE_MIN_ATTEMPTS = 2      // completed attempts at the current level
MAX_GUIDE_LEVEL   = 4

if (completed attempts at current level ≥ 2) AND (avg accuracy ≥ 80%)
    → recommend guide_level + 1   (capped at 4)
```
This is itself a **cognitive-engagement / mastery** signal: how quickly a child
"graduates" to less support.

---

## 9. Badges (gamification)

Badges are awarded server-side (`server/utils/badges.js`) on lesson completion.
Each badge is **unique per student** (a DB unique index prevents duplicates), and
every award also logs a `badge_earned` engagement event.

| Badge | Code | Rule |
|---|---|---|
| 🌟 First Lesson | `first_lesson` | ≥ 1 completed lesson |
| 💯 Perfect Score | `perfect_score` | a lesson finished at exactly **100%** |
| ⚡ Speed Star | `speed_star` | a lesson completed in **< 60 seconds** (and > 0) |
| 🤝 Helper | `helper` | completed a lesson **after using a hint** |
| 🔥 3-Day Streak | `streak_3` | logged in on **≥ 3 distinct days** |

> Badges are part of the **intervention** experience. In the control condition
> the same completions are recorded, but the celebratory badge UI is suppressed
> (`exp.gamified` gates the display), so badge *counts* still exist in the data
> for both groups but are not surfaced to control children.

---

## 10. Engagement measurement model

### 10.1 The event log (`engagement_events`)
A single flexible table captures fine-grained signals. Valid `event_type`s
(`server/routes/events.js`):
```
tts_used, hint_used, badge_earned, quiz_answered, lesson_started,
lesson_completed, attempt, completion, retry, time_on_task, mood,
level_select, self_correction, tracing_attempt, chatbot_used
```
Each event can carry: `activity_type`, `metric_name`, `metric_value` (numeric),
`session_id`, `week_number`, and a free-form JSON `metadata` blob. Events are
logged **silently in the background** so they never interrupt the child.

Mapping of events to the three engagement dimensions:

| Dimension | Events / signals |
|---|---|
| Behavioural | `lesson_started`, `lesson_completed`, `attempt`, `completion`, `retry`, `time_on_task`, login days, session minutes |
| Emotional | `mood` (`mood_start`, `mood_end`), teacher `frustration_1to5` |
| Cognitive | `hint_used`, `quiz_answered` (with correct/incorrect), `self_correction`, `tracing_attempt` (accuracy), response time, guide-level progression |

### 10.2 Mood (emotional engagement)
- **Start-of-session**: a 5-face mood picker (`MoodCheckIn.jsx`) is shown once
  per session on the student dashboard; logged as `mood_start` (value 1–5).
- **End-of-session**: shown on logout (`Layout.jsx`); logged as `mood_end`.
- Identical for both groups → a clean pre/post emotional measure, and the
  **mood delta** (`mood_end − mood_start`) is a usable affect-change variable.

### 10.3 Sessions & time-on-task (`study_sessions`)
- One row per login: `login_time`, `logout_time`, `session_date`, `week_number`,
  `study_group`, `total_lessons_done`.
- **Session minutes** = `logout_time − login_time` (falls back to login_time if
  the session was never closed). **Login days** = distinct `session_date`s.
- A separate `progress.time_spent_seconds` accumulates active time *inside*
  activities, giving a second, finer time-on-task measure.

### 10.4 Teacher ratings (`teacher_ratings`)
For triangulation, teachers rate any student (both groups) on a 1–5 rubric:
`attention_1to5`, `participation_1to5`, `frustration_1to5`, plus free-text
`notes`. Multiple ratings over time form an observational trend.

### 10.5 Engagement & motivation indicators (mapping to the study's questions)
A common examiner expectation is that the research measures **engagement and
motivation**, not only mathematical competency. Every indicator below is already
captured by the system — this table maps each requested indicator to the
concrete data source so it can be reported directly.

| Engagement indicator | How the system measures it | Source |
|---|---|---|
| **Time spent using the software** | session minutes (`logout − login`) per login + accumulated in-activity time | `study_sessions`, `progress.time_spent_seconds` |
| **Number of activities completed** | count of completed lessons/activities (overall and per topic/disability) | `progress.completed`, teacher report `lessons_completed` |
| **Frequency of interactions** | volume of logged behavioural events (attempts, answers, retries, TTS taps, hints) and login days | `engagement_events`, `study_sessions.session_date` |
| **Attention & participation during sessions** | teacher rubric scores (1–5) recorded per session | `teacher_ratings.attention_1to5`, `participation_1to5` |
| **Motivation / interest before & after** | start-of-session and end-of-session **mood** (5-face scale, 1–5); the **mood delta** is a pre/post affect-change variable | `engagement_events` (`mood_start`, `mood_end`), see §10.2 |
| **Frustration (inverse motivation signal)** | teacher-rated frustration per session, triangulating self-reported mood | `teacher_ratings.frustration_1to5` |

Because each indicator carries `study_group` and (where relevant) `week_number`,
the same signals support **three comparisons**: intervention vs. control,
week-1 vs. week-2 (within-subject change), and per-student trends. This lets the
study evaluate whether the software **increases engagement and motivation** in
children with Dyscalculia, alongside any gains in mathematical competency. For a
pre/post "motivation and interest" measure specifically, use the mood delta
(`mood_end − mood_start`) and the trend in attention/participation ratings across
the two weeks (analysed with the non-parametric tests in §15.3).

---

## 11. Per-question response-time analytics

A dedicated subsystem records **how long each child takes to answer each
individual question** — a strong cognitive-engagement / processing-speed signal,
especially relevant for learning-difficulty research.

- **Capture.** Every answer in both the reading quiz (`Quiz.jsx`) and the maths
  engine (`QuizGame.jsx`) measures the milliseconds from question-shown to
  answer-tapped and POSTs it to `/api/responses` with the activity, question
  index, correctness, and whether a hint was showing.
- **Storage.** `question_responses` table (one row per answered question),
  `response_time_ms` clamped to [0, 600 000] ms.
- **Per-student summary** (`GET /api/responses/:id/summary`):
  - overall **average, median (P50), min, max**, count, and accuracy %;
  - **breakdown by activity** (avg time + accuracy per topic);
  - the **10 slowest** individual questions;
  - a **trend**: average of the **first 20** vs the **most recent 20** answers,
    revealing whether the child is speeding up (fluency gain) or slowing down.
- **Class-level flag.** In the teacher report a student is flagged
  `slow_responder` when they have ≥ 3 responses and their average is **> 1.5×
  the class average** — a fast way to spot children who need more processing time.

This data lets the researcher compare **processing speed and its change over the
2 weeks** between the intervention and control groups.

---

## 12. Teacher tools & the two-group workflow

### 12.1 Group selection (the study workflow)
Teachers land on a **"Choose a group"** screen (`GroupSelect.jsx`) showing three
cards with live counts:
- 🎮 **Intervention** (fun path), 📋 **Control** (plain path), ➕ **Unassigned**.

Clicking a card opens that group's student list (`GroupStudents.jsx`), where the
teacher can:
- open any child's detailed profile, or
- **move a student to another path with one tap** (`POST /api/teacher/group`).

This is how a researcher allocates participants: students log in (by code or
name), then the teacher sorts them into the two arms of the study. The chosen
group governs that child's experience from their next login.

### 12.2 Per-student detail (`StudentDetail.jsx`)
A full profile per child: maths level grid (score per activity × level), total
stars, completion/avg-score/time summary cards, **response-time analytics**,
mood trend, engagement counts (TTS, hints, answers, login days, badges), and the
teacher rubric form + rating history. Includes a per-student CSV export.

### 12.3 Class analytics (`TeacherDashboard.jsx`, `/teacher/dashboard`)
A sortable table of all students (those needing attention float to the top) with
per-disability scores and automatic **attention flags**:

| Flag | Trigger |
|---|---|
| `struggling` | completed ≥ 1 lesson in an area but averaging **< 60%** |
| `not_started` | **0** lessons completed |
| `hint_reliant` | answered ≥ 3 questions and used **a hint on ≥ all** of them |
| `slow_responder` | ≥ 3 responses and avg response time **> 1.5× class avg** |
| `inactive` | no login for **≥ 3 days** |

### 12.4 Class overview heatmap (`/teacher/overview`)
A class-wide maths score matrix (`GET /api/teacher/matrix`) for a per-activity,
per-level heatmap across all students.

---

## 13. Database schema (every table & column)

All tables use PostgreSQL with `gen_random_uuid()` primary keys (pgcrypto).

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | VARCHAR(100), nullable | NULL for anonymous research students |
| role | VARCHAR(20) | `teacher` \| `student` |
| language | VARCHAR(10) | `en` \| `si` |
| grade | INT | |
| password_hash | TEXT | teachers only (bcrypt) |
| study_group | VARCHAR(20) | `intervention` \| `control` (research arm) |
| age | INT | research attribute |
| difficulty_type | VARCHAR(30) | e.g. dyslexia/dyscalculia/dysorthographia |
| anon_code | VARCHAR(20), unique | de-identified login code |
| created_at | TIMESTAMP | |

### `lessons`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| title_en / title_si | TEXT | bilingual |
| type | VARCHAR(30) | reading/quiz/picture_match/numbers/spelling/math |
| category | VARCHAR(20) | dyslexia/dyscalculia/dysorthographia |
| difficulty | INT 1–5 | |
| content | JSONB | flexible per-type structure |
| created_at | TIMESTAMP | |

### `progress` (one row per student × lesson)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| student_id → users | UUID | |
| lesson_id → lessons | UUID | |
| score | INT | latest attempt's % |
| time_spent_seconds | INT | accumulated active time |
| completed | BOOLEAN | |
| attempts | INT | increments per attempt |
| completed_at | TIMESTAMP | |

### `engagement_events` (the flexible signal log)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| student_id → users | UUID | |
| session_id → study_sessions | UUID | |
| event_type | VARCHAR(50) | see valid list |
| activity_type | VARCHAR(40) | e.g. activity id or category |
| metric_name | VARCHAR(50) | e.g. `score`, `time_on_task`, `mood_start` |
| metric_value | NUMERIC | |
| week_number | INT | study week |
| metadata | JSONB | extra context |
| created_at | TIMESTAMP | |

### `study_sessions`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| student_id → users | UUID | |
| session_date | DATE | |
| login_time / logout_time | TIMESTAMP | time-on-task |
| total_lessons_done | INT | |
| week_number | INT | |
| study_group | VARCHAR(20) | stamped at login |

### `badges`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| student_id → users | UUID | |
| badge_type | VARCHAR(50) | first_lesson/streak_3/perfect_score/speed_star/helper |
| earned_at | TIMESTAMP | unique per (student, badge_type) |

### `teacher_ratings` (observational rubric, both groups)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| student_id → users | UUID | |
| session_id → study_sessions | UUID | |
| attention_1to5 / participation_1to5 / frustration_1to5 | INT 1–5 | |
| notes | TEXT | |
| rated_by → users | UUID | the teacher |
| created_at | TIMESTAMP | |

### `tracing_attempts` (intervention only)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| student_id / session_id | UUID | |
| target_word | TEXT | |
| accuracy_pct | NUMERIC | 0–100 closeness to guide |
| completed | BOOLEAN | |
| time_ms | INT | |
| retries | INT | |
| guide_level | INT | 1 = full dashes … higher = fewer (prompt fading) |
| created_at | TIMESTAMP | |

### `question_responses` (per-question response time)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| student_id / session_id / lesson_id | UUID | |
| activity_type | VARCHAR(40) | |
| question_index | INT | |
| correct | BOOLEAN | |
| used_hint | BOOLEAN | |
| response_time_ms | INT | 0–600 000 |
| week_number | INT | |
| created_at | TIMESTAMP | |

Indexes exist on all foreign keys and on `created_at` / `metric_name` /
`activity_type` to keep reporting queries fast.

---

## 14. Complete API reference

All `/api/*` routes (except login/register) require `Authorization: Bearer
<JWT>`. Global rate limit 600 req / 15 min; `/api/auth` limited to 50 / 15 min.

### Auth
| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | public | Student (anon_code or name) / teacher login; opens a session |
| POST | `/api/auth/register` | public | Create teacher account (needs invite code) |
| POST | `/api/auth/logout` | auth | Records logout time for the open session |

### Student-facing
| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/api/students/:id/dashboard` | self/teacher | Dashboard aggregate (completed, weekly goal, streak, badges, next lesson) |
| GET | `/api/lessons` (`?difficulty=`) | auth | List lessons |
| GET | `/api/lessons/:id` | auth | One lesson's content |
| POST | `/api/progress` | auth | Save progress (runs badge + adaptive logic) |
| GET | `/api/progress/:studentId` | self/teacher | All progress for a student |
| POST | `/api/events` | auth | Log an engagement event |
| POST | `/api/math/result` | auth | Record a maths activity result |
| GET | `/api/math/progress` | auth | Per-activity/level best scores (roadmap) |
| POST | `/api/tracing` | auth | Record a tracing attempt (intervention) |
| GET | `/api/tracing/:studentId/guide-level` | self/teacher | Recommended guide level (prompt fading) |
| POST | `/api/responses` | auth | Log a per-question response time |
| GET | `/api/responses/:studentId` | self/teacher | Raw response log |
| GET | `/api/responses/:studentId/summary` | self/teacher | Response-time analytics |
| GET | `/api/badges/:studentId` | self/teacher | Earned badges |
| POST | `/api/badges` | auth | Award a badge |
| POST | `/api/sessions/:id/end` | auth | Close a session (time-on-task) |

### Teacher-only
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/teacher/students` | List students with quick stats |
| GET | `/api/teacher/report` (`?format=csv`) | **Aggregated research report** (JSON or CSV) |
| GET | `/api/teacher/student/:id` | Full per-child detail (incl. response-time summary) |
| POST | `/api/teacher/group` | **Assign/move a student's research group** |
| POST | `/api/teacher/rating` | Save a rubric rating |
| POST | `/api/teacher/assign` | Surface a specific lesson to a student |
| GET | `/api/teacher/matrix` | Class-wide maths score matrix (heatmap) |
| POST/PUT/DELETE | `/api/lessons[/:id]` | Author lessons |

### System
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness + DB connectivity check |

---

## 15. Data export & analysis guide

### 15.1 The research CSV (`GET /api/teacher/report?format=csv`)
One row per student. Columns:
```
student_id, name, grade, language, study_group,
lessons_completed, avg_score, total_time_seconds,
tts_used, hint_used, quiz_answered, badge_count,
login_days, total_session_minutes,
avg_response_ms, response_count, days_inactive,
dyslexia_done, dyslexia_avg, dyscalculia_done, dyscalculia_avg,
dysorthographia_done, dysorthographia_avg,
needs_attention, flags
```

This single file is the backbone of a between-groups analysis: it already carries
`study_group` and one aggregated value per student for each key dependent
variable.

### 15.2 Deeper, event-level extracts
For richer analyses, query the raw tables directly (read-only). Useful examples:

**Mood change (pre/post) per student & group**
```sql
SELECT u.id, u.study_group,
       AVG(e.metric_value) FILTER (WHERE e.metric_name='mood_start') AS mood_start,
       AVG(e.metric_value) FILTER (WHERE e.metric_name='mood_end')   AS mood_end
FROM users u
JOIN engagement_events e ON e.student_id = u.id AND e.event_type='mood'
WHERE u.role='student'
GROUP BY u.id, u.study_group;
```

**Per-question response time by group & week**
```sql
SELECT u.study_group, qr.week_number,
       AVG(qr.response_time_ms) AS avg_ms,
       AVG((qr.correct)::int)   AS accuracy
FROM question_responses qr
JOIN users u ON u.id = qr.student_id
GROUP BY u.study_group, qr.week_number
ORDER BY u.study_group, qr.week_number;
```

**Tracing accuracy progression (intervention only)**
```sql
SELECT student_id, guide_level,
       AVG(accuracy_pct) AS avg_acc, COUNT(*) AS n
FROM tracing_attempts
GROUP BY student_id, guide_level
ORDER BY student_id, guide_level;
```

### 15.3 Suggested statistical approach
Given the small sample (10–20) and a two-group design:
- **Primary comparison:** intervention vs. control on each dependent variable
  (avg_score, total_time, mood_delta, avg_response_ms, hint usage, etc.).
- With n this small and likely non-normal distributions, prefer
  **non-parametric tests**: **Mann–Whitney U** for between-group comparisons,
  **Wilcoxon signed-rank** for within-subject pre/post (e.g. mood start vs end,
  week-1 vs week-2 response time).
- Report **effect sizes** (e.g. rank-biserial r, or Cliff's delta) alongside
  p-values — with small n, effect size is more informative than significance.
- Consider the **3 engagement dimensions** as a small construct set; you can
  present per-dimension composite scores (e.g. z-standardise each signal within
  the dimension and average).
- Treat results as **exploratory / pilot** given the sample size.

### 15.4 Reproducibility
- The exact scoring formulas are in §7–§9 and fixed in code.
- The CSV is generated server-side and is deterministic for a given DB state.
- Keep a DB snapshot at study end so the dataset is frozen for re-analysis.

---

## 16. Security, privacy & ethics

- **Authentication:** JWT (30-day expiry); teacher passwords bcrypt-hashed
  (cost 12).
- **Authorisation:** strict self-or-teacher checks; students cannot read others'
  data.
- **Transport & headers:** Helmet with a scoped Content-Security-Policy; CORS
  locked to `FRONTEND_URL` in production; `trust proxy` for Railway.
- **Abuse limits:** global + stricter auth rate limits; 100 kB JSON body cap;
  input validation and value clamping on every write.
- **De-identification:** research participants use `anon_code` with **no name**;
  the schema explicitly allows NULL names for this purpose. Use this mode for the
  study so exported data contains no direct identifiers.
- **Consent:** student logins are simple by design (young children, supervised
  setting). Collect informed consent/assent per your institution's ethics
  protocol before enrolling participants. (See README "Notes on research
  ethics".)
- **Data minimisation:** only learning-relevant signals are collected; no audio,
  video, or free typing from children is stored (mood is a tap; answers are
  choices/strokes).

---

## 17. Deployment & setup

### 17.1 Environment variables (server)
```
DATABASE_URL=postgresql://user:pass@host:5432/db   # required
JWT_SECRET=<long random string>                    # required in production
TEACHER_PASSWORD=<invite/bootstrap password>       # default 'teacher123'
NODE_ENV=production                                 # enables SSL + CORS lockdown
FRONTEND_URL=https://<app>.railway.app             # allowed CORS origin(s)
RUN_MIGRATIONS=true|false                           # auto-apply schema on boot (default on)
PORT=3000                                            # optional
```

### 17.2 Local development
```bash
cp .env.example server/.env        # set DATABASE_URL, JWT_SECRET, TEACHER_PASSWORD
npm install && npm run install:all # root + client + server deps
npm run db:setup                   # create tables from schema.sql
npm run db:seed                    # sample lessons + demo teacher/students
npm run dev                        # API :3000, client :5173 (Vite proxy)
```
Pure-SQL alternative (no Node for DB): `psql "$DATABASE_URL" -f server/db/schema.sql -f server/db/seed.sql`.

### 17.3 Production (Railway)
- Add the PostgreSQL plugin (provides `DATABASE_URL`).
- Deploy the repo (NIXPACKS via `railway.json`); the root build installs both
  apps and builds the client; `npm start` runs Express, which serves
  `client/dist`.
- Set env vars (above); run `db:setup` + `db:seed` once.

---

## 18. Limitations & threats to validity

- **Small sample (10–20):** results are pilot-level; use non-parametric tests and
  report effect sizes; avoid over-claiming generalisability.
- **Latest-score storage:** `progress.score` stores the most recent attempt, not
  the best; choose and state your scoring convention (latest vs. best from the
  client roadmap) consistently.
- **Self-report mood:** a single tap on a 5-face scale is coarse; triangulate
  with the teacher frustration rating.
- **Response-time noise:** times include reading/UI time and can be affected by
  distraction; the median and the slow-responder threshold (1.5× class) help, but
  treat individual outliers cautiously. Times are clamped at 10 minutes.
- **TTS variability:** Web Speech voices/quality differ by browser/device, which
  could affect the audio experience between participants.
- **Group assignment is manual:** the teacher allocates groups, so document your
  randomisation procedure separately (the system records the assignment but does
  not itself randomise).
- **Attendance/engagement confounds:** absences and out-of-app factors over the
  2 weeks can affect login-days and time metrics.

---

## 19. Dyscalculia-specific design & pre-mathematics support

Because the final target group consists **only of students identified with
Dyscalculia**, this section makes explicit *what in the software is designed for
Dyscalculia* (rather than being a general mathematics app) and *how each feature
addresses a known characteristic of the disability*. It is written to directly
answer the anticipated examiner question:

> *"What features in the software are specifically designed for children with
> Dyscalculia, and how do these features help overcome the challenges associated
> with the disability?"*

### 19.1 Why Dyscalculia needs more than maths exercises
Dyscalculia is a specific learning difficulty in **numerical processing**.
Affected children frequently struggle *before* they reach problem-solving — with
**number recognition**, **quantity / magnitude understanding (number sense)**,
**mathematical symbols** (`+ − × ÷ = < >`), **place value**, **arithmetic-fact
retrieval**, and they often carry **maths anxiety** and **slower processing /
higher working-memory load**. A tool that only presents problems to solve would
assume foundations these learners may not yet have. The platform therefore
*teaches and represents the numbers themselves* before asking the child to
calculate.

### 19.2 How the software is built for Dyscalculia (already implemented)
Every item below is grounded in the source code cited.

| Dyscalculia challenge | Feature that addresses it | Where (code) |
|---|---|---|
| **Number & symbol recognition** | A **learn-first flow** runs an animated teaching intro *before* any game (`learn → choose level → play`), with place-value digit highlighting and explicit symbol/expression visuals (`+ − × ÷ =`) | `MathActivity.jsx` flow (§6.2); `TEACH` steps & `TeachVisual.jsx` (`number`, `expr` visuals) |
| **Quantity / magnitude (number sense, subitising)** | Concrete **object-group visuals** (e.g. "3 rows of 4 apples = 12") and a dedicated **count-the-objects** activity where the child maps a set of pictures to a numeral | `TEACH` `groups` visual; `NumberGame.jsx` (count objects → tap the number); `numbers` lesson type (§6.1) |
| **Abstract concepts (fractions, place value, area)** | **Manipulable/visual models** — fraction bars, place-value digits, area grids — turn abstractions into pictures | `TeachVisual.jsx` (`fractionBar`, `fraction`, `grid`, `number`) |
| **Step-by-step understanding** | A **guided demonstration then a scaffolded "try"** step is shown before the real round, so the child rehearses the concept with feedback first | `mathTeach.js` `try` steps; `InteractiveTry.jsx`; `TeachIntro.jsx` |
| **Multi-sensory learning** | Each concept is delivered through **three channels at once**: *visual* (animated SVG/emoji), *audio* (Text-to-Speech on every prompt, rate 0.85), and *interactive* (tap/drag with feedback) | `TeachVisual.jsx` animations; `useTTS.js`; `experience.js` instant-feedback layer |
| **Maths anxiety / low confidence** | **No timers, no hint penalty in maths, gradual unlocking** (Level 1 always open; pass ≥ 70% to unlock the next), plus encouragement messages in the intervention arm — designed to build confidence slowly | §7.2, §8.1 (`PASS_SCORE`); `Encouragement.jsx`; `experience.js` |
| **Slow numerical processing / working memory** | **Per-question response time** is captured and a `slow_responder` flag gives extra-time learners visibility; short rounds (default 6 questions) limit cognitive load | §11; `question_responses`; `slow_responder` flag (§12.3) |
| **Reading-load barrier to maths** | **Dyslexia-friendly, bilingual presentation** (OpenDyslexic, large text, Sinhala/English, picture answers) removes literacy obstacles that would otherwise mask numeracy ability — important given frequent comorbidity | §6.3 accessibility features |

**In short:** the introductory teaching layer (number/symbol recognition,
quantity via concrete objects, step-by-step guided demos, simplified and
gradual lessons, and multi-sensory visual + audio + interactive delivery) is the
component that makes this a *Dyscalculia* tool rather than a general maths app.

### 19.3 The Number Foundations module (Dyscalculia pre-mathematics)
Because the cohort is exclusively Dyscalculia learners, a dedicated
**🌱 Number Foundations** module was added as the **first** module in the
syllabus (`mathSyllabus.js`). It deliberately teaches the prerequisites *before*
any arithmetic. Each activity runs a full **teach → "you try" → practice** cycle
and reuses the existing scoring/stars/response-time logging and research
persistence. All activities are registered in the server whitelist
(`server/routes/math.js`, module `foundations`, category `dyscalculia`), so their
results flow into the standard progress and teacher reports automatically.

**Animated "explainer video" lessons.** Every foundation activity opens with a
short, narrated, animated lesson (`components/math/ConceptVideo.jsx`, content in
`lib/foundationsLessons.js`) that plays like a video: each *scene* shows an
animated visual and is **read aloud**, auto-advancing when the narration ends
(`useTTS` now exposes an `onend` hook, with a length-based fallback timer).
Children can **pause, replay a line, step back/forward, or re-watch** the whole
lesson, and the final scene is a tap-to-answer "you try". This delivers the six
introductory components requested in supervision:

| Requested component | How it is delivered |
|---|---|
| **Short animated explainer videos** | `ConceptVideo` auto-plays multi-scene animated + narrated lessons with playback controls (▶️/⏸️/⏮️/replay) |
| **Visual learning with pictures, objects & real-life examples** | scenes use apples, cars, fish, cookies, balloons, ten-frames, dot groups and number lines (`count`, `tenframe`, `compare`, `numberLine`, `groups` visuals) |
| **Interactive number-recognition exercises** | the `number_recognition` / `number_words` activities + the in-lesson `InteractiveTry` and the practice round |
| **Step-by-step guided demonstrations before the real task** | each lesson walks concept → worked example → "you try" *before* the scored practice game |
| **Simplified introductory lessons that build confidence gradually** | small number ranges, 3 difficulty levels with unlocking, no timers/penalties |
| **Multi-sensory (visual + audio + interactive feedback)** | animation (visual) + Text-to-Speech narration (audio) + tap-to-answer with spoken praise (interactive) on every scene |

The six activities and the skill each builds:

| Foundation activity | Dyscalculia skill it builds | How it works (code) |
|---|---|---|
| **Readiness Check** (`foundations_check`) | baseline number-sense screening | `FoundationsCheck.jsx` samples the six skills below, scores readiness, and **recommends a starting point** (Foundations vs. the Numbers module) by band (< 50 / 50–79 / ≥ 80); the score is persisted as a normal result for baseline + change tracking |
| **Count the Objects** (`count_objects`) | counting & quantity (number sense, subitising) | animated lesson (count apples/cars, ten-frame) then `GENERATORS.count_objects` — the child taps the numeral matching N pictures |
| **Find the Number** (`number_recognition`) | numeral recognition (spoken/written word → digit) | lesson links shape ↔ name ↔ quantity; the child hears/reads a number word and taps the digit |
| **Number Words** (`number_words`) | the numeral ↔ word link | lesson pairs numeral and word; the child picks the word that names a numeral (bilingual bank, `NUM_EN`/`NUM_SI`) |
| **More or Fewer** (`compare_quantity`) | magnitude comparison | lesson shows two dot groups (`compare` visual, incl. "equal"); the child chooses which has more/fewer |
| **Before & After** (`number_order`) | number sequence | lesson uses a `numberLine` and a gapped sequence (`8, ?`) to prompt the next/previous number |
| **Maths Signs** (`symbols`) | meaning of `+ − = × ÷ < >` | lesson explains each sign; the child matches a sign to its meaning |

Difficulty scales the number range (e.g. 1–5 → 1–10 → 1–20) and tightens the
distractors at higher levels, exactly as the rest of the maths engine does.
Opening a lesson logs a `lesson_started` engagement event, so lesson-watching
contributes to the engagement metrics in §10.5.

### 19.4 Voice-based study assistant and guardian progress tracking
Two further features align the platform with the intervention described in the
research proposal (Sections 1.6 and 3.5.4):

- **Voice-based study assistant** (`components/math/StudyBuddy.jsx`,
  `lib/assistant.js`, `hooks/useSpeechInput.js`). An on-demand helper available
  to students across the app. The child asks by voice (browser speech
  recognition, where available) or by tapping a suggested question, and the
  assistant answers in simple bilingual language and reads the reply aloud
  (`useTTS`). Matching is keyword-based, so it runs offline on modest devices.
  It operationalises IV4 and the ZPD "more knowledgeable other", and each use is
  logged as a `chatbot_used` engagement event.
- **Guardian progress tracking** (`pages/GuardianView.jsx`,
  `server/routes/guardian.js`, route `/guardian`). A read-only summary
  (activities completed, levels mastered, average score, minutes learning,
  active days, badges, mood trend, recent activities) retrieved with the child's
  login code, so a parent or guardian can follow progress outside the classroom.
  Access is read-only and code-based, matching the anonymised student login.

### 19.5 Further enhancements (not yet implemented)
Flagged honestly so the write-up does not overclaim:

- **Pre-recorded video / voice-over clips.** The animated explainer lessons
  (§19.3) are rendered live (CSS/SVG animation + browser Text-to-Speech narration)
  rather than streamed media files. This is intentional — it keeps the bundle
  tiny and works offline/on low-end devices — but a teacher-recorded voice-over
  or MP4 could be slotted into the same `ConceptVideo` scenes later.
- **Tracing/writing of numerals** — the `TracingCanvas` + prompt-fading
  machinery already exists for letters and could scaffold digit formation.
- **Auto-routing from the Readiness Check** straight into a tailored playlist
  (currently it *recommends* a starting point; the child taps to proceed).

### 19.6 Demonstrating accommodation in the research write-up
To evidence that the software *accommodates Dyscalculia* (not just teaches
maths), pair §19.2 with the engagement/motivation measures in §10.5: report (a)
the foundational teaching features used, and (b) whether they coincide with
improved confidence/motivation (mood delta, attention/participation) and reduced
frustration over the two weeks — alongside competency gains.

---

## 20. Glossary

| Term | Meaning |
|---|---|
| **Intervention group** | Students receiving the full gamified, instant-feedback, guided-tracing experience |
| **Control group** | Students receiving the same content/measurement with a plain presentation (no game elements, no instant feedback) |
| **Engagement (3 dimensions)** | Behavioural, emotional, cognitive — each backed by logged signals |
| **anon_code** | De-identified student login code (no name) used for research |
| **Prompt fading** | Gradual withdrawal of tracing guide dashes as the child becomes accurate |
| **Adaptive difficulty** | Automatic level adjustment based on score (<60 ease, >85 step up) |
| **PASS_SCORE** | 70% — the threshold to pass a level and unlock the next |
| **week_number** | 1-based study week derived from the student's first login |
| **time-on-task** | Engaged time, from session login/logout and from `progress.time_spent_seconds` |

---

*Generated from the source code of the Read & Play platform. All formulas,
thresholds, table definitions, and routes in this document reflect the
implementation as committed to the repository and can be cross-checked against
the files cited in each section.*
