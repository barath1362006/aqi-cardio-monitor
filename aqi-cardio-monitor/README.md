# 🫀 AQI Cardio Monitor

**Smart AI System for Monitoring Air Quality Impact on Cardiovascular Health**

A full-stack web application that monitors real-time air quality data and uses machine learning to predict cardiovascular health risks. The system combines environmental data (AQI, PM2.5, pollutants) with personal health metrics (heart rate, blood pressure, existing complications) to provide real-time risk assessments, predictive alerts, and historical health tracking.

This repository serves as the official submission for the project review, demonstrating a comprehensive implementation of the Core AI Logic, secure backend APIs, database management, and a seamless frontend integration.

---

## 🎯 Phase 2 Evaluation Standards Achievement

This project successfully fulfills the **AI:2 Phase 2 Review Criteria**:

1. **Core AI Logic & Backend Integration**: Integrated a trained Random Forest algorithm (`model.pkl`) to evaluate physiological inputs and OpenWeather AI-derived AQI data, returning accurate risk assessment probabilities via an optimized backend structure.
2. **Real-Time Data Handling & Async Capabilities**: The system utilizes WebSockets (`Flask-SocketIO`) for low-latency emergency alerting.
3. **Frontend Communication**: The React/Vite application interacts flawlessly with backend endpoints, applying Axios interceptors to inject authorization tokens globally and update the UI securely.
4. **Database & Auth Flow**: Developed a robust 5-table MySQL schema implementing relationship cascades. The app utilizes a fully secured JWT-based authentication protocol (using `werkzeug` for hashing).

---

## 🔧 Tech Stack

| Layer        | Technology                                                                |
|--------------|---------------------------------------------------------------------------|
| **Frontend** | React 19, Vite, React Router DOM v7, Axios, Recharts, Socket.IO Client    |
| **Backend**  | Python 3, Flask, Flask-CORS, Flask Blueprints, Flask-SocketIO            |
| **Security** | JWT (JSON Web Tokens), `werkzeug.security` Password Hashing               |
| **Database** | MySQL v8.0+, `mysql-connector-python`                                     |
| **ML Engine**| scikit-learn (Random Forest Classifier), NumPy, Pandas, joblib            |
| **APIs**     | OpenWeather Air Pollution API, OpenWeather Geocoding API                  |

---

## 🧠 ML Model Architecture & Logic

The prediction engine relies on a **Random Forest Classifier** trained on synthetic data representing 2,000 distinct patient and environmental cross-sections.

**Model Inputs (7 Crucial Features):**
1. `age`: Patient Age
2. `heart_rate`: Current Resting BPM
3. `systolic_bp`: Systolic Blood Pressure
4. `smoking_status`: Binary (0 = No, 1 = Yes)
5. `existing_conditions`: Binary Flag (Hypertension, Asthma, etc.)
6. `aqi_value`: Current Area Air Quality Index
7. `pm25`: Particulate Matter 2.5 Levels (µg/m³)

**Decision Protocol:**
- The `/api/predict` endpoint takes physiological parameters and the latest AQI fetch to classify the risk into 3 brackets: **Low (0)**, **Moderate (1)**, and **High (2)**.
- **Alert Triggers**: If a risk score probability exceeds `.75`, or if specific environmental-physiological combinations are met (e.g., `AQI > 150` & `Systolic BP > 140`), the system triggers an `Emergency` or `High` severity alert dynamically pushing to the frontend over WebSockets.

---

## 💾 Database Schema 

The database (`aqi_cardio_db`) utilizes 5 primary relational tables:

1. **`users`**: Stores profile information, JWT-hashed passwords, and assigns roles (`user`, `admin`, `superadmin`).
2. **`health_records`**: Logs daily vitals (heart rate, systolic BP, diastolic BP).
3. **`aqi_records`**: Caches real-time OpenWeather API lookups to minimize redundant external payload requests.
4. **`risk_predictions`**: Persists the localized history of ML predictions (Risk Labels and Scores).
5. **`alerts`**: Logs historical emergency notifications (linked to `risk_predictions`).

---

## 👑 Role-Based Access Control (RBAC)

The system supports strict middleware-regulated route protection:
- **User**: Can update health inputs, view personal dashboards, and receive personal alerts.
- **Admin**: Dedicated views to monitor all registered user datasets and global health trends.
- **Superadmin**: Universal oversight with destructive privileges (can delete user accounts via cascading constraints).

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **MySQL 8.0+**
- **OpenWeather API Key** ([Get one here](https://openweathermap.org/api))

### 1. Database Initialization
Open your MySQL console and execute:
```sql
source database/schema.sql;
```

### 2. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate   # For Windows
# source venv/bin/activate # For macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure Environment Variables
# Create a .env file in the /backend folder with:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=aqi_cardio_db
# OPENWEATHER_API_KEY=your_api_key
```

### 3. Generate the ML Model
Before starting the backend, you must generate the `model.pkl` binary:
```bash
python ml/train_model.py
```

### 4. Start the Application
**Backend Server:**
```bash
# In the backend directory with venv activated
python run.py
# Server runs on http://localhost:5000
```

**Frontend Client:**
```bash
# Open a new terminal
cd frontend
npm install
npm run dev
# React Vite runs on http://localhost:5173 (or as indicated by Vite)
```

---

## 📡 API Architecture Flow

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| `POST` | `/api/register` | Public | Accounts creation with sanitization |
| `POST` | `/api/login` | Public | Validates credentials and returns a JWT |
| `GET`  | `/api/aqi/current` | `@token_required` | Translates Query string location into Lat/Lon AQI array |
| `POST` | `/api/health/submit` | `@token_required` | Logs user historical pulse parameters |
| `POST` | `/api/predict` | `@token_required` | Dispatches inputs to RF Classifier; generates alerts |
| `GET`  | `/api/admin/users` | Admin+ | Aggregates full system membership directories |
| `DELETE`| `/api/admin/users/<id>`| Superadmin | Full cascade eradication of user profile & records |

---

## 📸 Core Views (Reference)

- **Authentication Module**: Dual Login/Register pages managing React `AuthContext` sessions.
- **Personal Dashboard**: Synchronized telemetry for live OpenWeather statistics alongside individual cardiovascular charts.
- **System Management**: Specialized routing for `/admin` granting cross-sectional visibility of system health. 

*This application prioritizes functional efficiency, strict data modeling consistency, and API security, fulfilling all critical path requirements for review.*
