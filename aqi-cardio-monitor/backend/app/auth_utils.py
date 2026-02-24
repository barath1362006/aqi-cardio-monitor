import jwt
from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta
from config import Config

def token_required(f):
    """Decorator to protect routes with JWT."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'error': 'Token is missing!'}), 401

        try:
            # Decode token
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            # In a real app, you would check if user exists in DB here
            # For now, we just pass the user data to the route
            request.user = data
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token is invalid!'}), 401
        except Exception as e:
            return jsonify({'error': f'Auth failed: {str(e)}'}), 401

        return f(*args, **kwargs)

    return decorated

def generate_token(user_data):
    """Generate a JWT token for a user."""
    payload = {
        'user_id': user_data['user_id'],
        'name': user_data['name'],
        'role': user_data['role'],
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")
