import pytest
import json
from unittest.mock import patch

def test_register_success(client, mock_db):
    mock_conn, mock_cursor = mock_db
    
    # Mock user NOT existing
    mock_cursor.fetchone.return_value = None
    
    # Mock lastrowid
    mock_cursor.lastrowid = 1
    
    response = client.post('/api/register', 
                           data=json.dumps({
                               "name": "Test User",
                               "email": "test@example.com",
                               "password": "password123"
                           }), 
                           content_type='application/json')
    
    if response.status_code != 201:
        print(f"DEBUG: {response.data}")
    
    assert response.status_code == 201
    assert b"User registered successfully" in response.data

def test_register_existing_user(client, mock_db):
    mock_conn, mock_cursor = mock_db
    
    # Mock user ALREADY existing
    mock_cursor.fetchone.return_value = {"email": "test@example.com"}
    
    response = client.post('/api/register', 
                           data=json.dumps({
                               "name": "Test User",
                               "email": "test@example.com",
                               "password": "password123"
                           }), 
                           content_type='application/json')
    
    assert response.status_code == 400
    assert b"Email already registered" in response.data

def test_login_success(client, mock_db):
    mock_conn, mock_cursor = mock_db
    
    # Mock user existence with correct password hash (mocked check_password_hash needed or just mock auth_utils)
    # Actually, auth_routes uses check_password_hash from werkzeug.security
    # I'll mock the check_password_hash function
    with patch("app.routes.auth_routes.check_password_hash", return_value=True):
        mock_cursor.fetchone.return_value = {
            "user_id": 1,
            "name": "Test User",
            "email": "test@example.com",
            "password_hash": "hashed_password",
            "role": "user",
            "age": 25,
            "smoking_status": "no",
            "existing_conditions": ""
        }
        
        response = client.post('/api/login', 
                               data=json.dumps({
                                   "email": "test@example.com",
                                   "password": "password123"
                               }), 
                               content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert "token" in data
        assert data["user"]["name"] == "Test User"
