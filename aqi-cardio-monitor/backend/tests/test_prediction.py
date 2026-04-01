import pytest
import json
from unittest.mock import patch, MagicMock

def test_predict_risk_success(client, mock_db, auth_headers):
    mock_conn, mock_cursor = mock_db
    headers = auth_headers(user_id=1)
    
    # Mocking the ML model prediction
    with patch('app.routes.prediction_routes.model') as mock_model:
        mock_model.predict.return_value = [2] # 2 = High Risk
        mock_model.predict_proba.return_value = [[0.1, 0.2, 0.7]] # [Low, Moderate, High]
        
        # side_effect: First fetchone() gets AQI record, Second gets alert cooldown (None)
        mock_cursor.fetchone.side_effect = [
            {'aqi_value': 180, 'pm25': 55.5}, # AQI Record
            None # Alert Cooldown (no recent alert)
        ]
        mock_cursor.lastrowid = 100
        
        response = client.post('/api/predict', 
                               data=json.dumps({
                                   "aqi_id": 1,
                                   "heart_rate": 85,
                                   "systolic_bp": 145,
                                   "age": 45,
                                   "smoking_status": 1,
                                   "existing_conditions": 1
                               }), 
                               headers=headers,
                               content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["risk_label"] == "High"
        assert data["alert_triggered"] is True

def test_predict_risk_no_auth(client):
    response = client.post('/api/predict', 
                           data=json.dumps({"aqi_id": 1}), 
                           content_type='application/json')
    assert response.status_code == 401
