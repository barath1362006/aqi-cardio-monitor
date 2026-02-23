-- ============================================
-- AQI Cardio Monitor — Database Schema
-- Database: aqi_cardio_db
-- ============================================

CREATE DATABASE IF NOT EXISTS aqi_cardio_db;
USE aqi_cardio_db;

-- --------------------------------------------
-- Table 1: users
-- --------------------------------------------
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    age INT,
    smoking_status ENUM('yes', 'no') DEFAULT 'no',
    existing_conditions VARCHAR(255),
    role ENUM('superadmin', 'admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------
-- Table 2: health_records
-- --------------------------------------------
CREATE TABLE health_records (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    heart_rate INT,
    systolic_bp INT,
    diastolic_bp INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- --------------------------------------------
-- Table 3: aqi_records
-- --------------------------------------------
CREATE TABLE aqi_records (
    aqi_id INT PRIMARY KEY AUTO_INCREMENT,
    city VARCHAR(100),
    aqi_value INT,
    pm25 FLOAT,
    pm10 FLOAT,
    co FLOAT,
    no2 FLOAT,
    o3 FLOAT,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------
-- Table 4: risk_predictions
-- --------------------------------------------
CREATE TABLE risk_predictions (
    prediction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    aqi_id INT NOT NULL,
    risk_label ENUM('Low', 'Moderate', 'High') NOT NULL,
    risk_score FLOAT,
    alert_triggered BOOLEAN DEFAULT FALSE,
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (aqi_id) REFERENCES aqi_records(aqi_id) ON DELETE CASCADE
);

-- --------------------------------------------
-- Table 5: alerts
-- --------------------------------------------
CREATE TABLE alerts (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    prediction_id INT NOT NULL,
    message TEXT,
    severity ENUM('Low', 'Moderate', 'High', 'Emergency') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (prediction_id) REFERENCES risk_predictions(prediction_id) ON DELETE CASCADE
);

-- ============================================
-- End of Schema
-- ============================================
