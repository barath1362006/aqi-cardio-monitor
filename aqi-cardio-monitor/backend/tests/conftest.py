import pytest
import json
from app import create_app
from unittest.mock import MagicMock, patch
from app.auth_utils import generate_token

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
    })
    yield app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers():
    def _headers(user_id=1, name="Test User", role="user"):
        token = generate_token({"user_id": user_id, "name": name, "role": role})
        return {"Authorization": f"Bearer {token}"}
    return _headers

@pytest.fixture
def mock_db(mocker):
    # Mock the db connection and cursor
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    
    # Target common route modules
    targets = [
        "app.routes.auth_routes.get_connection",
        "app.routes.health_routes.get_connection",
        "app.routes.prediction_routes.get_connection",
        "app.routes.aqi_routes.get_connection",
        "app.routes.admin_routes.get_connection"
    ]
    
    for target in targets:
        try:
            mocker.patch(target, return_value=mock_conn)
        except (ImportError, AttributeError):
            pass
            
    # Also patch the original just in case
    mocker.patch("app.db.get_connection", return_value=mock_conn)
    mocker.patch("app.db.close_connection", return_value=None)
    
    return mock_conn, mock_cursor
