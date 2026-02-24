# Project Analysis & Handoff Document (v2.1)

This document provides a concise overview of the **AQI Cardio Monitor** project structure, logic flow, and recent architectural improvements.

## 1. Core Architecture
- **Frontend**: React (Vite) + Vanilla CSS. Uses `AuthContext` for state management.
- **Backend**: Flask. Blueprint-based structure (Auth, AQI, Health, Prediction, Admin).
- **Database**: MySQL. Handled via `mysql-connector-python` in `backend/app/db.py`.
- **ML Component**: Random Forest Classifier (`sklearn`). Model is serialized as `model.pkl`.

## 2. Implemented Logic & Fixes
### Authentication & Security
- **JWT Integration**: Added JWT authentication for all protected routes. Tokens are generated upon login/register and stored in the frontend.
- **Authenticated Requests**: All health, prediction, and profile routes now require a valid token.
- **User Isolation**: Requests are now tied to the `user_id` extracted securely from the JWT token.

### Onboarding & Profile
- **Two-Stage Setup**: Registration is now simplified (Name, Email, Password). Health details are collected post-login via a dedicated setup component.
- **Profile Management**: Added a `/profile` page where users can view and edit their age, smoking status, and existing conditions.
- **Data Integrity**: Implemented "Hyper-Defensive Sanitization" in the backend to handle optional fields and prevent MySQL type mismatch errors (e.g., blank strings in integer columns).

### Risk Prediction
- **Real Metadata**: The prediction flow in `HealthInput.jsx` and `Dashboard.jsx` now uses the authenticated user's real profile data (age, smoking status) instead of hardcoded placeholders.

## 3. Machine Learning (ML) Details
- **Algorithm**: **Random Forest Classifier**.
- **Reason for Selection**:
    - **Robustness**: Handles high-dimensional data (7 features) without overfitting easily.
    - **Non-Linearity**: Effectively captures complex interactions between environmental (AQI) and physiological (BP, Heart Rate) data.
    - **Feature Importance**: Allows the system to quantify which factors (like PM2.5 vs age) contribute most to heart risk.
- **Disease Focus**: Predicts **Cardiovascular Warning Levels** (Low, Moderate, High Risk). This specifically helps identify immediate risk for **Hypertension**, **Myocardial Infarction (Heart Attack)**, and **Stroke** during pollution spikes.

## 4. Developer Instructions
1. **Setup**:
   - `python -m venv venv`
   - `pip install -r requirements.txt`
   - `python ml/train_model.py` (Required to generate `model.pkl`)
2. **Environment**:
   - Create `backend/.env` with `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DB`, `OPENWEATHER_API_KEY`, and `SECRET_KEY`.
3. **Frontend**:
   - `npm install`
   - `npm run dev`
