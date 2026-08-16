<div align="center">

# <img src="https://raw.githubusercontent.com/shreyash445/SkillSwap/main/mobile/assets/icon.png" width="42" align="center" /> SkillSwap

### Peer-to-Peer Skill Bartering App

**Teach what you know. Learn what you don't.**

Swap skills one-for-one with fellow students — no money, no courses, just people helping people level up.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![Django](https://img.shields.io/badge/Django-092E20?style=flat-square&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Django REST](https://img.shields.io/badge/Django%20REST%20Framework-092E20?style=flat-square&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Reanimated](https://img.shields.io/badge/Reanimated-000000?style=flat-square&logo=react&logoColor=white)](https://docs.swmansion.com/react-native-reanimated/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

</div>

---

## ✦ Overview

SkillSwap is a complete mobile-first MVP for **complementary skill matching** on campus.
Create a profile of what you can teach and what you want to learn, get matched with the
people who complement your skills, propose one-to-one swaps, chat, and rate each other.

| Layer | Technology |
|---|---|
| **Mobile** | Expo · React Native · TypeScript · React Navigation · Reanimated |
| **Backend** | Django 5 · Django REST Framework · SimpleJWT |
| **Storage** | SQLite (Postgres-ready schema) |
| **Auth** | JWT access/refresh, college `.edu` email signup |

---

## ✦ Features

### Onboarding
- Animated **splash** with spring-loaded logo + tagline
- 3-slide **welcome carousel** over a living **lava-lamp background** (blur + drifting blobs)
- Skill selector: pick what you teach + want (2–5 each) with proficiency levels & availability

### Discover
- **Vertical swipeable feed** of student cards with photo covers
- Filter by skill category, search by name, sort by best match / newest / rating
- **Complementary-match badge** highlighting users who teach what you want
- Propose a swap with both sides' skills, duration, date, and a message

### Exchanges & Chat
- Full lifecycle: **Pending → Accepted → Completed / Cancelled**
- Accept, decline, cancel, and complete swaps
- Async messaging (polling) with unread indicators on the dock

### Community
- 5-star **ratings** + feedback after a completed swap
- **Leaderboard** ranked by average rating
- Editable profiles with bio, availability, and rating history

---

## ✦ Tech Stack

### Languages
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

### Mobile
![React Native](https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Reanimated](https://img.shields.io/badge/Reanimated-000000?style=for-the-badge&logo=react&logoColor=white)
![React Navigation](https://img.shields.io/badge/React%20Navigation-2E3A59?style=for-the-badge&logo=react&logoColor=white)

### Backend
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![Django REST Framework](https://img.shields.io/badge/DRF-092E20?style=for-the-badge&logo=django&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

---

## ✦ Getting Started

### 1 · Run the backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed        # 50 skills + 15 demo students
python manage.py runserver 0.0.0.0:8000
```

API base: `http://<your-PC-LAN-IP>:8000/api/`

> **Demo login:** `alice.chen@student.edu` / `demo1234`
>
> Signup requires a `.edu` email. Change `ALLOWED_SIGNUP_DOMAINS` in
> `backend/config/settings.py` to allow other campus domains.

### 2 · Run the mobile app

```powershell
cd mobile
npm install
npx expo start
```

- Phone + PC on the **same Wi-Fi network**
- Scan the QR with **Expo Go** — the app auto-detects the dev machine IP and talks to Django on `:8000`
- If detection fails, copy `.env.example` → `.env` and set `EXPO_PUBLIC_API_URL`

> **Windows Firewall (first run):**
> ```powershell
> New-NetFirewallRule -DisplayName "SkillSwap Django" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
> ```

---

## ✦ Screen Map

| Screen | What it does |
|---|---|
| Splash | Animated logo intro |
| Login / Register | `.edu` signup, JWT session |
| Welcome carousel | 3-slide intro over lava background |
| Onboarding | Pick teach + want skills, availability |
| Discover | Swipeable student feed, filters, match badges |
| Propose swap | Skills, duration, date, message |
| Exchanges | Pending → Accepted → Completed / Cancelled |
| Chat | Async polling, unread dots |
| Rate | 5-star + feedback |
| Leaderboard | Ranked by avg rating |
| Profile | Bio, availability, ratings |

---

## ✦ API Reference

```
POST   /api/auth/register              POST   /api/auth/login
POST   /api/auth/logout                GET/PATCH /api/auth/me
GET    /api/skills                     POST   /api/me/skills
DELETE /api/me/skills/<id>             GET    /api/users?sort=match|recent|rating
GET    /api/users/<id>                 GET/POST /api/exchanges
PATCH  /api/exchanges/<id>             POST   /api/exchanges/<id>/rate
GET/POST /api/exchanges/<id>/messages
GET    /api/notifications              GET    /api/leaderboard
```

---

## ✦ Project Structure

```
skillswap-mvp/
├── backend/                  # Django REST API (port 8000)
│   ├── config/               # settings, urls, wsgi
│   └── core/                 # models, serializers, views, seed command
└── mobile/                   # Expo app
    └── src/
        ├── components/       # Dock, Splash, LavaLamp, sheets, etc.
        ├── context/          # Auth, Theme providers
        ├── screens/          # Welcome, Onboarding, Discover, Chat, ...
        └── utils/            # skill→photo mapping, api client
```

---

## ✦ Notes

- SQLite keeps setup instant; the schema mirrors the spec's PostgreSQL design — switching
  to Postgres later is a settings-only change.
- Messaging is polling-based per the MVP spec (no WebSockets yet).
- Matching is a deterministic complementary query — no ML, exactly as specified.
- Run backend sanity checks anytime: `python test_flow.py`

---

<div align="center">

> *"The best way to learn is to teach — and the best way to grow is to swap."*

Made with 💜 · [Report a bug](https://github.com/shreyash445/SkillSwap/issues) · [SkillSwap](https://github.com/shreyash445/SkillSwap)

</div>