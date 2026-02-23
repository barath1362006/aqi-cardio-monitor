# 🫀 AQI Cardio Monitor

**Smart AI System for Monitoring Air Quality Impact on Cardiovascular Health**

A full-stack web application that monitors real-time air quality data and uses machine learning to predict cardiovascular health risks. The system combines environmental data (AQI, PM2.5, pollutants) with personal health metrics (heart rate, blood pressure) to provide real-time risk assessments and health alerts.

---

## 🔧 Tech Stack

| Layer        | Technology                                     |
|-------------|------------------------------------------------|
| Frontend    | React, React Router DOM, Axios, Recharts       |
| Backend     | Python Flask, Flask-CORS, Flask Blueprints      |
| Database    | MySQL (via mysql-connector-python)              |
| ML Model    | scikit-learn (Random Forest), joblib, pandas    |
| External API| OpenWeather Air Pollution API + Geocoding API   |
| Env Config  | python-dotenv (.env files)                      |

---

## 🚀 Setup Instructions

### Prerequisites
- **Python 3.8+** installed
- **Node.js 16+** and npm installed
- **MySQL 8.0+** installed and running
- **OpenWeather API Key** — [Get one here](https://openweathermap.org/api)

---

### Step 1: Set Up MySQL Database

1. Open **MySQL Workbench** or your MySQL client
2. Run the schema script:
   ```sql
   source database/schema.sql;
   ```
   Or open `database/schema.sql` and execute the script manually.

---

### Step 2: Set Up Python Backend

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt

# Configure environment variables
# Edit backend/.env with your actual credentials:
#   DB_HOST=localhost
#   DB_USER=root
#   DB_PASSWORD=your_password
#   DB_NAME=aqi_cardio_db
#   OPENWEATHER_API_KEY=your_api_key
```

---

### Step 3: Train the ML Model (Run Once)

```bash
# From the backend folder
python ml/train_model.py
```

This will generate `ml/model.pkl`. You only need to run this once.

---

### Step 4: Start the Flask Backend

```bash
# From the backend folder (with venv activated)
python run.py
```

The Flask server will start on **http://localhost:5000**.

---

### Step 5: Start the React Frontend

```bash
# Navigate to frontend folder
cd frontend

# Install npm packages
npm install

# Start the development server
npm start
```

The React app will start on **http://localhost:3000**.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/register` | Register a new user |
| `POST` | `/api/login` | Login with email & password |
| `GET` | `/api/aqi/current?city=Chennai` | Fetch current AQI for a city |
| `GET` | `/api/aqi/history?days=7` | Get AQI history for last N days |
| `POST` | `/api/health/submit` | Submit health data (heart rate, BP) |
| `GET` | `/api/health/history?user_id=1` | Get health records for a user |
| `POST` | `/api/predict` | Run ML risk prediction |
| `GET` | `/api/alerts?user_id=1` | Get alerts for a user |
| `GET` | `/api/admin/users` | List all users (admin only) |
| `GET` | `/api/admin/records` | List all health records (admin only) |
| `DELETE` | `/api/admin/users/<id>` | Delete a user (superadmin only) |

---

## 📸 Screenshots

> Add screenshots here after running the application:
> 
> - **Login Page**: `screenshots/login.png`
> - **Dashboard**: `screenshots/dashboard.png`
> - **Health Input**: `screenshots/health-input.png`
> - **Alerts Page**: `screenshots/alerts.png`
> - **History Page**: `screenshots/history.png`
> - **Admin Panel**: `screenshots/admin.png`

---

## 👑 Creating the First Super Admin

Since there's no self-registration for admin roles, create one directly in MySQL:

```sql
USE aqi_cardio_db;

INSERT INTO users (name, email, password_hash, age, smoking_status, role)
VALUES (
    'Super Admin',
    'admin@aqicardio.com',
    -- This is the hash for password "admin123" (generated with werkzeug)
    'scrypt:32768:8:1$salt$hash',
    30,
    'no',
    'superadmin'
);
```

**Or** register normally via the app, then update the role:

```sql
UPDATE users SET role = 'superadmin' WHERE email = 'your_email@example.com';
```

---

## 📁 Project Structure

```
aqi-cardio-monitor/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API configuration
│   │   └── context/    # Auth context
│   └── .env
├── backend/            # Flask API server
│   ├── app/
│   │   ├── routes/     # API route blueprints
│   │   ├── db.py       # Database connection
│   │   └── ml_model.py # ML model loader
│   ├── ml/             # ML training & model
│   ├── config.py
│   ├── run.py
│   └── .env
├── database/
│   └── schema.sql      # MySQL schema
└── README.md
```

---

## 📄 License

This project is developed for educational purposes.
