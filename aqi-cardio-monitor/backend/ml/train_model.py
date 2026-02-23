"""
ML Model Training Script
Trains a Random Forest Classifier to predict cardiovascular risk
based on health metrics and air quality data.

Run this script once before starting the Flask server:
    python ml/train_model.py
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os


def generate_synthetic_data(n_samples=2000):
    """Generate synthetic training data matching our feature set."""
    np.random.seed(42)

    data = {
        'age': np.random.randint(20, 80, n_samples),
        'heart_rate': np.random.randint(55, 120, n_samples),
        'systolic_bp': np.random.randint(90, 180, n_samples),
        'smoking_status': np.random.randint(0, 2, n_samples),
        'existing_conditions': np.random.randint(0, 2, n_samples),
        'aqi_value': np.random.randint(20, 300, n_samples),
        'pm25': np.random.uniform(5, 200, n_samples).round(2)
    }

    df = pd.DataFrame(data)

    # Create risk_label based on rules:
    # 0 = Low:      aqi < 100 AND systolic_bp < 120
    # 1 = Moderate:  aqi 100–150 OR systolic_bp 120–140
    # 2 = High:      aqi > 150 OR systolic_bp > 140
    conditions = []
    for _, row in df.iterrows():
        aqi = row['aqi_value']
        bp = row['systolic_bp']

        if aqi > 150 or bp > 140:
            conditions.append(2)  # High
        elif (100 <= aqi <= 150) or (120 <= bp <= 140):
            conditions.append(1)  # Moderate
        else:
            conditions.append(0)  # Low

    df['risk_label'] = conditions

    return df


def train_model():
    """Train the Random Forest model and save it."""
    print("=" * 50)
    print("AQI Cardio Risk — ML Model Training")
    print("=" * 50)

    # Generate synthetic data
    print("\n[1/4] Generating synthetic training data...")
    df = generate_synthetic_data(2000)
    print(f"  Dataset shape: {df.shape}")
    print(f"  Risk distribution:\n{df['risk_label'].value_counts().to_string()}")

    # Prepare features and target
    print("\n[2/4] Preparing features...")
    feature_columns = ['age', 'heart_rate', 'systolic_bp', 'smoking_status',
                       'existing_conditions', 'aqi_value', 'pm25']

    X = df[feature_columns]
    y = df['risk_label']

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"  Training samples: {len(X_train)}")
    print(f"  Testing samples: {len(X_test)}")

    # Train Random Forest
    print("\n[3/4] Training Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"\n  Accuracy: {accuracy:.4f}")
    print(f"\n  Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Low', 'Moderate', 'High']))

    # Feature importance
    print("  Feature Importance:")
    for feat, imp in sorted(zip(feature_columns, model.feature_importances_), key=lambda x: -x[1]):
        print(f"    {feat}: {imp:.4f}")

    # Save model
    print("\n[4/4] Saving model...")
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    joblib.dump(model, model_path)
    print(f"  Model saved to: {model_path}")

    print("\n" + "=" * 50)
    print("Training complete! You can now start the Flask server.")
    print("=" * 50)


if __name__ == '__main__':
    train_model()
