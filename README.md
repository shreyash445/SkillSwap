# SkillSwap — Peer-to-Peer Skill Bartering App

Find someone who teaches what you want to learn, and teach them what they need.

A complete **MVP** built from `SkillSwap_MVP_Specification.md`: college-email auth, skill
profiles, complementary matching, exchange proposals, async messaging, ratings, and a
leaderboard.

- **Backend** — Django 5 + Django REST Framework + SQLite (JWT auth, 20 endpoints, seeded demo data)
- **Mobile** — Expo (React Native + TypeScript), React Navigation, Reanimated motion, dark minimal design

```
skillswap-mvp/
├── backend/   # Django REST API (port 8000)
└── mobile/    # Expo app (Expo Go / emulator)
```

---

## 1. Run the backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed          # 50 skills + 14 demo students
python manage.py runserver 0.0.0.0:8000
```

The API is now at `http://<your-PC-LAN-IP>:8000/api/`.

> Demo login: `alice.chen@student.edu` / `demo1234`
> Signup requires a `.edu` email — change `ALLOWED_SIGNUP_DOMAINS` in `config/settings.py` to allow other campus domains.

## 2. Run the mobile app

```powershell
cd mobile
npm install
npx expo start
```

- Phone and PC must be on the **same Wi-Fi network**.
- Scan the QR code with **Expo Go** (Android/iOS). The app auto-detects the dev machine's
  IP and talks to Django on port 8000 — no config needed.
- If auto-detection fails, copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL`.

> **Windows Firewall:** the first time, allow inbound connections on port 8000 for the
> private network — otherwise your phone can't reach the backend:
> `New-NetFirewallRule -DisplayName "SkillSwap Django" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow`

## 3. What's inside

| Screen | What it does |
|---|---|
| Login / Register | College-email signup, JWT session, logout |
| Onboarding | Pick skills you teach + want (2–5 each), availability |
| Discover | Browse people, filter by skill, sort by best match/newest/rating, complementary-match badge |
| Propose swap | Pick both sides' skills, 30/60/90 min, date, message |
| Exchanges | Pending → Accepted → Completed/Cancelled, accept/decline/cancel/complete |
| Chat | Async messaging (8–10s polling), unread dot on tabs |
| Rate | 5-star + feedback after a completed swap |
| Leaderboard | Ranked by average rating |
| Profile | Edit bio/availability, view your ratings |

## 4. API quick reference

```
POST   /api/auth/register          POST   /api/auth/login
POST   /api/auth/logout            GET/PATCH /api/auth/me
GET    /api/skills                 POST   /api/me/skills
DELETE /api/me/skills/<id>         GET    /api/users?sort=match|recent|rating
GET    /api/users/<id>             GET/POST /api/exchanges
PATCH  /api/exchanges/<id>         POST   /api/exchanges/<id>/rate
GET/POST /api/exchanges/<id>/messages
GET    /api/notifications          GET    /api/leaderboard
```

## 5. Notes

- SQLite keeps setup instant; the schema matches the spec's PostgreSQL design, so swapping
  to Postgres later is a settings change.
- Messaging is polling-based per the MVP spec (no WebSockets).
- Matching is a hardcoded complementary-query — no ML, exactly as the spec intended.
- Run backend sanity tests anytime with `python test_flow.py`.

Happy swapping! 🚀