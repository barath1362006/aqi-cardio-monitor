from flask import Blueprint, request, jsonify
import joblib
import numpy as np
import os
from app.db import get_connection, close_connection
from app.auth_utils import token_required

prediction_bp = Blueprint('prediction', __name__)

# Load model once at import time
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'ml', 'model.pkl')
model = None

try:
    model = joblib.load(MODEL_PATH)
    print("[ML] Model loaded successfully")
except Exception as e:
    print(f"[ML WARNING] Could not load model: {e}")
    print("[ML WARNING] Run 'python ml/train_model.py' first to generate model.pkl")

RISK_LABELS = {0: 'Low', 1: 'Moderate', 2: 'High'}


@prediction_bp.route('/api/predict', methods=['POST'])
@token_required
def predict_risk():
    """Run risk prediction using the ML model."""
    try:
        if model is None:
            return jsonify({'error': 'ML model not loaded. Run train_model.py first.'}), 503

        data = request.get_json()

        # Validate required fields
        required = ['user_id', 'aqi_id', 'heart_rate', 'systolic_bp', 'age',
                     'smoking_status', 'existing_conditions']
        for field in required:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400

        user_id = data['user_id']
        aqi_id = data['aqi_id']

        # Get AQI data from database
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT aqi_value, pm25 FROM aqi_records WHERE aqi_id = %s", (aqi_id,))
        aqi_record = cursor.fetchone()

        if not aqi_record:
            cursor.close()
            close_connection(conn)
            return jsonify({'error': 'AQI record not found'}), 404

        aqi_value = aqi_record['aqi_value']
        pm25 = aqi_record['pm25']

        # Prepare features in correct order
        def to_int(val, default=0):
            try:
                if val is None or val == '': return default
                return int(val)
            except:
                return default

        features = np.array([[
            to_int(data.get('age'), 30),
            to_int(data.get('heart_rate')),
            to_int(data.get('systolic_bp')),
            to_int(data.get('smoking_status')),
            to_int(data.get('existing_conditions')),
            to_int(aqi_value),
            float(pm25)
        ]])

        # Run prediction
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        risk_score = float(max(probabilities))
        risk_label = RISK_LABELS.get(prediction, 'Unknown')

        # Alert logic
        alert_triggered = False
        systolic_bp = int(data['systolic_bp'])

        if aqi_value > 150 and systolic_bp > 140:
            alert_triggered = True
        if risk_score > 0.75:
            alert_triggered = True

        # Save prediction to database
        query = """
            INSERT INTO risk_predictions (user_id, aqi_id, risk_label, risk_score, alert_triggered)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (user_id, aqi_id, risk_label, risk_score, alert_triggered))
        conn.commit()
        prediction_id = cursor.lastrowid

        # If alert triggered, insert into alerts table
        if alert_triggered:
            severity = 'Emergency' if risk_score > 0.9 else 'High' if risk_label == 'High' else 'Moderate'
            message = (
                f"⚠️ Health Alert: Your cardiovascular risk level is {risk_label} "
                f"(score: {risk_score:.2f}). AQI is {aqi_value}, "
                f"Systolic BP is {systolic_bp}. Please take precautions."
            )
            alert_query = """
                INSERT INTO alerts (user_id, prediction_id, message, severity)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(alert_query, (user_id, prediction_id, message, severity))
            conn.commit()

        cursor.close()
        close_connection(conn)

        return jsonify({
            'prediction_id': prediction_id,
            'risk_label': risk_label,
            'risk_score': round(risk_score, 4),
            'alert_triggered': alert_triggered
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@prediction_bp.route('/api/alerts', methods=['GET'])
@token_required
def get_alerts():
    """Fetch all alerts for a given user."""
    try:
        user_id = request.args.get('user_id')

        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400

        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT a.alert_id, a.user_id, a.prediction_id, a.message, a.severity, a.created_at,
                   rp.risk_label, rp.risk_score, rp.aqi_id
            FROM alerts a
            JOIN risk_predictions rp ON a.prediction_id = rp.prediction_id
            WHERE a.user_id = %s
            ORDER BY a.created_at DESC
        """
        cursor.execute(query, (user_id,))
        alerts = cursor.fetchall()

        cursor.close()
        close_connection(conn)

        # Convert datetime objects to strings
        for alert in alerts:
            alert['created_at'] = alert['created_at'].isoformat() if alert['created_at'] else None

        return jsonify(alerts), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
