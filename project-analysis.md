# 🏥 AQI Cardio Monitor — Project Analysis

> **Project Name:** Smart AI System for Monitoring Air Quality Impact on Cardiovascular Health  
> **Codename:** `aqi-cardio-monitor`  
> **Date:** February 23, 2026  

---

## 📌 What I Understood

This project is a **full-stack health monitoring web application** that:

1. **Fetches real-time Air Quality Index (AQI)** data from the OpenWeather API for a given city
2. **Collects cardiovascular health data** (heart rate, blood pressure) from users
3. **Uses a trained ML model** (Random Forest Classifier) to predict cardiovascular risk levels based on both AQI and health data
4. **Triggers alerts** when high-risk conditions are detected (dangerous AQI + abnormal vitals)
5. **Provides dashboards** with charts, gauges, and alert banners for users to monitor their health
6. **Includes admin controls** for user management and record monitoring

### Core Idea
> "If the air quality is bad AND your health vitals are abnormal, you are at elevated cardiovascular risk."  
> The system combines environmental + personal health data and uses ML to quantify that risk.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│          Port 3000 — User Interface Layer                │
│                                                          │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌───────────┐ │
│  │  Login/   │ │ Dashboard │ │  Health  │ │   Admin   │ │
│  │ Register  │ │  (Charts) │ │  Input   │ │   Panel   │ │
│  └──────────┘ └───────────┘ └──────────┘ └───────────┘ │
│         │            │            │             │        │
│         └────────────┴────────────┴─────────────┘        │
│                        Axios                             │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (CORS)
┌──────────────────────▼──────────────────────────────────┐
│                   BACKEND (Flask)                        │
│            Port 5000 — API + ML Layer                    │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Auth    │ │   AQI    │ │  Health  │ │ Predict   │  │
│  │  Routes  │ │  Routes  │ │  Routes  │ │  Routes   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│        │                                      │         │
│        │         ┌──────────────┐             │         │
│        │         │  ML Model    │◄────────────┘         │
│        │         │ (model.pkl)  │                        │
│        │         └──────────────┘                        │
│        │                                                 │
│  ┌─────▼─────────────────────────────────────────────┐  │
│  │              db.py (MySQL Connector)               │  │
│  └───────────────────────┬───────────────────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                   MySQL Database                         │
│               aqi_cardio_db (5 tables)                   │
│                                                          │
│   users ──┬──> health_records                            │
│           ├──> risk_predictions ──> alerts                │
│           │         ▲                                    │
│           │         │                                    │
│           └──> aqi_records                               │
└─────────────────────────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │ OpenWeather │
                    │     API     │
                    └─────────────┘
```

---

## 🔧 Tech Stack

| Layer        | Technology                                     |
|-------------|------------------------------------------------|
| Frontend    | React, React Router DOM, Axios, Recharts       |
| Backend     | Python Flask, Flask-CORS, Flask Blueprints      |
| Database    | MySQL (via mysql-connector-python)              |
| ML Model    | scikit-learn (Random Forest), joblib, pandas, numpy |
| External API| OpenWeather Air Pollution API + Geocoding API   |
| Env Config  | python-dotenv (.env files)                      |

---

## 📂 Folder Structure

```
aqi-cardio-monitor/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── AQICard.jsx
│   │   │   ├── RiskBadge.jsx
│   │   │   ├── AlertBanner.jsx
│   │   │   ├── AQIChart.jsx
│   │   │   ├── HealthChart.jsx
│   │   │   ├── RiskGauge.jsx
│   │   │   └── HistoryTable.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── HealthInput.jsx
│   │   │   ├── Alerts.jsx
│   │   │   ├── History.jsx
│   │   │   └── admin/
│   │   │       └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── App.jsx
│   ├── .env
│   └── package.json
│
├── backend/
│   ├── run.py
│   ├── config.py
│   ├── .env
│   ├── requirements.txt
│   ├── app/
│   │   ├── __init__.py
│   │   ├── db.py
│   │   ├── ml_model.py
│   │   └── routes/
│   │       ├── auth_routes.py
│   │       ├── aqi_routes.py
│   │       ├── health_routes.py
│   │       ├── prediction_routes.py
│   │       └── admin_routes.py
│   └── ml/
│       ├── train_model.py
│       └── model.pkl
│
├── database/
│   └── schema.sql
│
└── README.md
```

---

## 📋 Phase-by-Phase Analysis

### Phase 1 — Project & Database Setup

**Goal:** Lay the groundwork — folder structure + database schema.

| Instruction | What It Does | Key Details |
|-------------|-------------|-------------|
| 1.1 | Create folder structure | Frontend (React) + Backend (Flask) with all subdirectories and empty placeholder files |
| 1.2 | MySQL database script | 5 tables (`users`, `health_records`, `aqi_records`, `risk_predictions`, `alerts`) with FK constraints |

**Database Relationships:**
- `users` → 1:N → `health_records`
- `users` → 1:N → `risk_predictions`
- `aqi_records` → 1:N → `risk_predictions`
- `risk_predictions` → 1:N → `alerts`
- `users` → 1:N → `alerts`

**How we'll implement:**
- Create all directories using `mkdir -p` commands
- Write `schema.sql` with `CREATE DATABASE`, `USE`, and all `CREATE TABLE` statements
- User runs the script in MySQL Workbench manually

---

### Phase 2 — Backend (Flask) Setup

**Goal:** Build the entire REST API layer with 5 route blueprints + ML training.

| Instruction | File(s) | Endpoints |
|-------------|---------|-----------|
| 2.1 | `run.py`, `config.py`, `.env`, `requirements.txt`, `app/__init__.py` | — (setup only) |
| 2.2 | `app/db.py` | — (utility) |
| 2.3 | `routes/auth_routes.py` | `POST /api/register`, `POST /api/login` |
| 2.4 | `routes/aqi_routes.py` | `GET /api/aqi/current`, `GET /api/aqi/history` |
| 2.5 | `routes/health_routes.py` | `POST /api/health/submit`, `GET /api/health/history` |
| 2.6 | `ml/train_model.py` | — (run once to generate `model.pkl`) |
| 2.7 | `routes/prediction_routes.py` | `POST /api/predict`, `GET /api/alerts` |
| 2.8 | `routes/admin_routes.py` | `GET /api/admin/users`, `GET /api/admin/records`, `DELETE /api/admin/users/<id>` |

**How we'll implement:**
1. Set up Flask app factory pattern with CORS enabled
2. Use `mysql-connector-python` for all DB operations (no ORM)
3. Password hashing via `werkzeug.security` (generate/check)
4. OpenWeather API: Geocoding → lat/lon → Air Pollution endpoint
5. Train ML model with synthetic data matching our feature set
6. Role-based access: pass role via request headers (no JWT for simplicity)
7. Alert logic: `aqi > 150 && systolic_bp > 140` OR `risk_score > 0.75`

---

### Phase 3 — ML Model File

**Goal:** Create a clean model loading utility for Flask.

**How we'll implement:**
- Load `model.pkl` at Flask startup using `joblib.load()` — stored as a module-level variable
- `predict_risk()` accepts a dict, orders features correctly, calls `model.predict()` and `model.predict_proba()`
- `get_risk_label()` maps integer outputs → `{0: "Low", 1: "Moderate", 2: "High"}`
- Feature order: `[age, heart_rate, systolic_bp, smoking_status, existing_conditions, aqi_value, pm25]`

---

### Phase 4 — Frontend (React) Setup

**Goal:** Build the entire user interface — 7 pages + 8 components.

**Routing Plan:**

| Route | Page | Access |
|-------|------|--------|
| `/` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | Dashboard | Protected (any logged-in user) |
| `/health-input` | HealthInput | Protected |
| `/alerts` | Alerts | Protected |
| `/history` | History | Protected |
| `/admin` | AdminDashboard | Protected (admin/superadmin only) |

**Component Breakdown:**

| Component | Type | Purpose |
|-----------|------|---------|
| `Navbar` | Navigation | Links + logout + admin link (role-based) |
| `AQICard` | Display | Current AQI with color-coded value + pollutant breakdown |
| `RiskBadge` | Display | Risk level badge (green/orange/red) + score % |
| `AlertBanner` | Notification | Red banner at top with warning icon + dismiss |
| `AQIChart` | Chart (Recharts) | Line chart — AQI over last 7 days |
| `HealthChart` | Chart (Recharts) | Line chart — systolic BP + heart rate over time |
| `RiskGauge` | Chart (Recharts) | Radial bar chart as a gauge (0–100%) |
| `HistoryTable` | Data Table | Combined records table with pagination (10/page) |

**How we'll implement:**
- `AuthContext` stores `user_id`, `name`, `role` in React state
- Protected routes check context → redirect to `/` if not logged in
- All API calls via centralized Axios instance (`services/api.js`)
- Dashboard makes 5 API calls on load via `useEffect` hooks
- Admin page conditionally renders delete buttons for superadmin role

---

### Phase 5 — Integration & Testing

**Goal:** Verify the full system works end-to-end.

**Test Plan:**

1. **CORS check:** React (`:3000`) ↔ Flask (`:5000`) communication
2. **User flow:**
   - Register → Login → Dashboard loads AQI → Submit health data → Prediction → Alert triggered → Verify in DB
3. **Admin flow:**
   - Login as admin → Access `/admin` → Verify user cannot access `/admin`
4. **Error handling hardening:**
   - Backend: proper HTTP status codes (200/201/400/401/403/404/500), JSON error responses, input validation
   - Frontend: `.catch()` on all Axios calls, user-friendly error messages, loading spinners, network error handling

---

### Phase 6 — Final Polish

**Goal:** Make it look professional and document everything.

**Design Theme:**

| Element | Style |
|---------|-------|
| Background | White/light gray |
| Navbar | Deep blue `#1a3c5e` |
| Safe/Low | Green |
| Moderate | Orange |
| Danger/High | Red |
| Forms | Clean inputs, proper spacing, hover effects |
| Charts | Titles, legends, tooltips |
| Layout | Responsive (desktop + mobile) |

**README.md Contents:**
- Project description + tech stack
- Full setup instructions (MySQL → Python venv → train model → start Flask → start React)
- All API endpoints table
- Screenshot placeholders
- Super Admin creation guide

---

## 🚀 Implementation Order

This is the exact order we will follow to build the project:

```
Step  │ Instruction │ What We Build
──────┼─────────────┼──────────────────────────────
  1   │    1.1      │ Folder structure (all empty files)
  2   │    1.2      │ MySQL schema script (schema.sql)
  3   │    2.1      │ Flask app setup (run.py, config, .env, requirements)
  4   │    2.2      │ Database connection utility (db.py)
  5   │    2.3      │ Auth routes (register + login)
  6   │    2.4      │ AQI routes (fetch + history)
  7   │    2.5      │ Health routes (submit + history)
  8   │    2.6      │ ML model training (train_model.py) ← run manually
  9   │    2.7      │ Prediction routes (predict + alerts)
 10   │    2.8      │ Admin routes (users, records, delete)
 11   │    3.1      │ ML model loader (ml_model.py)
 12   │    4.1      │ React app setup (routing, Axios, AuthContext)
 13   │    4.2      │ Auth pages (Login + Register)
 14   │    4.3      │ Dashboard page (all data + charts)
 15   │    4.4      │ Components (8 reusable components)
 16   │    4.5      │ Remaining pages (HealthInput, Alerts, History)
 17   │    4.6      │ Admin Dashboard page
 18   │    5.1      │ Integration testing (end-to-end)
 19   │    5.2      │ Error handling + validation hardening
 20   │    6.1      │ CSS styling + responsive design
 21   │    6.2      │ README.md documentation
```

---

## ⚠️ Key Considerations

1. **OpenWeather API Key** — A valid API key is required. The free tier supports the Air Pollution endpoint.
2. **MySQL must be running** — The database and tables must be created before starting Flask.
3. **Model training first** — `train_model.py` must be run once to generate `model.pkl` before the Flask server can serve predictions.
4. **No JWT auth** — Role is passed via headers for simplicity. This is fine for a college/demo project but not production-ready.
5. **Synthetic data** — If the UCI Heart Disease dataset isn't available, we generate synthetic training data that matches our feature set.
6. **City hardcoded** — The default city is Chennai, but the API supports any city via query parameter.

---

## ✅ Ready to Build

All 6 phases (21 instructions) have been analyzed. The project is well-structured with clear separation of concerns. We will build it **instruction by instruction** in the order listed above.

> **Next Step:** Confirm this analysis, and we start with **Instruction 1.1 — Create Project Folder Structure**.
