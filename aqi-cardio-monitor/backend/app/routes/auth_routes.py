from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.db import get_connection, close_connection

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/api/register', methods=['POST'])
def register():
    """Register a new user."""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        name = data['name']
        email = data['email']
        password = data['password']
        age = data.get('age')
        smoking_status = data.get('smoking_status', 'no')
        existing_conditions = data.get('existing_conditions', '')

        # Hash the password
        password_hash = generate_password_hash(password)

        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = conn.cursor()

        # Check if email already exists
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close()
            close_connection(conn)
            return jsonify({'error': 'Email already registered'}), 400

        # Insert new user
        query = """
            INSERT INTO users (name, email, password_hash, age, smoking_status, existing_conditions, role)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (name, email, password_hash, age, smoking_status, existing_conditions, 'user'))
        conn.commit()

        user_id = cursor.lastrowid
        cursor.close()
        close_connection(conn)

        return jsonify({
            'message': 'User registered successfully',
            'user_id': user_id
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/api/login', methods=['POST'])
def login():
    """Login an existing user."""
    try:
        data = request.get_json()

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT user_id, name, email, password_hash, role FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        cursor.close()
        close_connection(conn)

        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401

        if not check_password_hash(user['password_hash'], password):
            return jsonify({'error': 'Invalid email or password'}), 401

        return jsonify({
            'success': True,
            'user_id': user['user_id'],
            'name': user['name'],
            'role': user['role']
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
