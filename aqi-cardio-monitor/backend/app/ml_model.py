"""
ML Model Loader
Loads model.pkl once at Flask startup and provides prediction utilities.
"""

import joblib
import numpy as np
import os

# Feature order must match training
FEATURE_ORDER = ['age', 'heart_rate', 'systolic_bp', 'smoking_status',
                 'existing_conditions', 'aqi_value', 'pm25']

RISK_LABELS = {0: 'Low', 1: 'Moderate', 2: 'High'}

# Load model once at module import time
_model = None
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml', 'model.pkl')

try:
    _model = joblib.load(MODEL_PATH)
    print(f"[ML Model] Loaded successfully from {MODEL_PATH}")
except FileNotFoundError:
    print(f"[ML Model] model.pkl not found at {MODEL_PATH}")
    print("[ML Model] Run 'python ml/train_model.py' to generate the model first.")
except Exception as e:
    print(f"[ML Model] Error loading model: {e}")


def get_risk_label(prediction_int):
    """Convert integer prediction (0/1/2) to risk label string."""
    return RISK_LABELS.get(prediction_int, 'Unknown')


def predict_risk(features_dict):
    """
    Run risk prediction using the loaded ML model.

    Args:
        features_dict: Dictionary with keys matching FEATURE_ORDER
            Example: {'age': 45, 'heart_rate': 95, 'systolic_bp': 145,
                      'smoking_status': 1, 'existing_conditions': 0,
                      'aqi_value': 160, 'pm25': 75.5}

    Returns:
        tuple: (risk_label: str, risk_score: float)
            risk_label: 'Low', 'Moderate', or 'High'
            risk_score: confidence probability (0.0 to 1.0)
    """
    if _model is None:
        raise RuntimeError("ML model is not loaded. Run train_model.py first.")

    # Convert dict to numpy array in correct feature order
    features = np.array([[features_dict[f] for f in FEATURE_ORDER]])

    # Predict
    prediction = _model.predict(features)[0]
    probabilities = _model.predict_proba(features)[0]
    risk_score = float(max(probabilities))
    risk_label = get_risk_label(prediction)

    return risk_label, risk_score
