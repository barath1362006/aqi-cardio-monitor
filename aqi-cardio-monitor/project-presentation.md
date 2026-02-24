# Project Presentation: AQI Cardio Monitor

## 1. Project Overview
**AQI Cardio Monitor** is a smart AI system designed to monitor the impact of air quality on cardiovascular health. It provides real-time risk assessments by combining environmental pollution data with personal health metrics.

## 2. Key Features
- **Simplified Onboarding**: Quick signup followed by a detailed health profile setup.
- **Real-Time AQI Monitoring**: Integration with OpenWeather API for live air quality updates.
- **Health Tracking**: Secure logging of heart rate and blood pressure.
- **AI Risk Prediction**: Predictive alerts based on a trained Machine Learning model.
- **User Profile**: A dedicated space to manage health status and account settings.

## 3. System Architecture & File Structure

### Backend (Python/Flask)
- `run.py`: Application entry point.
- `app/routes/auth_routes.py`: Handles JWT-secured login, registration, and profile updates.
- `app/routes/aqi_routes.py`: Fetches and saves live air quality data.
- `app/routes/health_routes.py`: Manages user health records (Heart Rate, BP).
- `app/routes/prediction_routes.py`: Orchestrates the ML prediction flow.
- `app/auth_utils.py`: Contains JWT token generation and authentication decorators.

### Frontend (React/Vite)
- `AuthContext.jsx`: Manages global user state and security tokens.
- `Dashboard.jsx`: Central hub showing AQI alerts and health summary.
- `Profile.jsx`: Detailed view of user health metrics.
- `HealthInput.jsx`: Form for submitting daily vitals for immediate risk assessment.

### Machine Learning (ML)
- `ml/train_model.py`: Script that generates 2,000 synthetic data points and trains the model.
- `ml/model.pkl`: The serialized trained brain of the system.

## 4. Deep Dive: Machine Learning & Health
### Why Random Forest?
We used **Random Forest Classifier** because:
1. **Decision Synergy**: It combines the results of multiple "decision trees" to provide a stable and accurate risk score.
2. **Feature Interdependence**: Air quality affects health differently based on age and existing conditions. Random Forest is excellent at understanding these conditional relationships.
3. **Handling Missing Data**: It is robust even if some secondary metadata is incomplete.

### How It Predicts Health Risks
The model analyzes 7 key inputs:
1. **Age**
2. **Heart Rate**
3. **Systolic BP**
4. **Smoking Status**
5. **Existing Conditions** (e.g., Asthma, Hypertension)
6. **AQI Value**
7. **PM2.5 Level**

### Disease Prediction
The system identifies high-risk states for:
- **Hypertension Exacerbation**: Sudden BP spikes caused by air toxins.
- **Myocardial Risk**: Increased heart strain during "Hazardous" AQI levels.
- **Respiratory-Triggered Cardiac Stress**: Predicting when conditions like Asthma might lead to cardiovascular complications.

## 5. API Functions Summary
| Endpoint | Method | Function |
| :--- | :--- | :--- |
| `/api/register` | POST | Creates new user account |
| `/api/login` | POST | Authenticates user & returns JWT |
| `/api/user/update-profile` | POST | Updates restricted health profile data |
| `/api/aqi/current` | GET | Fetches live pollution data from OpenWeather |
| `/api/health/submit` | POST | Logs daily vitals (HR/BP) |
| `/api/predict` | POST | Runs AI model on combined data |
| `/api/alerts` | GET | Retrieves historical health warnings |

## 6. Future Improvements Roadmap
1. **Real-World Training**: Replace synthetic data with the "Cardiovascular Disease" dataset from UCI/Kaggle to improve clinical accuracy.
2. **Predictive Analytics**: Implement time-series forecasting (LSTM) to predict AQI and Heart Rate for the next 24 hours.
3. **Automated Alerting**: Integrate **Twilio** or **SendGrid** for SMS and Email notifications when risk levels reach "High".
4. **Wearable Integration**: Support for API syncing with smartwatches (Apple Health, Fitbit) to automate vitals collection.
5. **Multi-City Support**: Allow users to manage multiple cities or use GPS to automatically fetch local AQI.

## 7. How to Login as Admin
To access the administrative features, follow these steps:
1. **Database Setup**: Open your MySQL terminal and update your user's role:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
2. **Application Access**:
   - Log in using your normal credentials.
   - Once the role is updated in the database, a new **Admin** link will automatically appear in the top navigation bar.
   - The Admin Dashboard allows you to view all user profiles and monitor global health records.
