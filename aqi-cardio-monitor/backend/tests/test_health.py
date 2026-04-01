import pytest
import json

def test_submit_health_data_success(client, mock_db, auth_headers):
    mock_conn, mock_cursor = mock_db
    
    headers = auth_headers(user_id=1)
    
    response = client.post('/api/health/submit', 
                           data=json.dumps({
                               "heart_rate": 75,
                               "systolic_bp": 120,
                               "diastolic_bp": 80
                           }), 
                           headers=headers,
                           content_type='application/json')
    
    if response.status_code != 201:
        print(f"DEBUG Health: {response.data}")
        
    assert response.status_code == 201
    assert b"Health data submitted successfully" in response.data

def test_submit_health_data_no_auth(client):
    response = client.post('/api/health/submit', 
                           data=json.dumps({
                               "heart_rate": 75,
                               "systolic_bp": 120,
                               "diastolic_bp": 80
                           }), 
                           content_type='application/json')
    
    assert response.status_code == 401
    assert b"Token is missing" in response.data

def test_submit_health_data_invalid_values(client, mock_db, auth_headers):
    mock_conn, mock_cursor = mock_db
    headers = auth_headers(user_id=1)
    
    response = client.post('/api/health/submit', 
                           data=json.dumps({
                               "heart_rate": -10,
                               "systolic_bp": 120,
                               "diastolic_bp": 80
                           }), 
                           headers=headers,
                           content_type='application/json')
    
    assert response.status_code == 400
    assert b"Health values must be positive numbers" in response.data
