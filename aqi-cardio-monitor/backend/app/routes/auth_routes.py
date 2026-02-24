from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.db import get_connection, close_connection
from app.auth_utils import generate_token, token_required

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
        
        # Hyper-defensive sanitization
        def clean_val(val, default=None):
            if val is None or str(val).strip() == '':
                return default
            return val

        age = clean_val(data.get('age'))
        smoking_status = clean_val(data.get('smoking_status'), 'no')
        existing_conditions = clean_val(data.get('existing_conditions'), '')
        
        # Ensure smoking_status is valid member of enum
        if smoking_status not in ['yes', 'no']:
            smoking_status = 'no'

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
        try:
            query = """
                INSERT INTO users (name, email, password_hash, age, smoking_status, existing_conditions, role)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (name, email, password_hash, age, smoking_status, existing_conditions, 'user'))
            conn.commit()
        except Exception as db_err:
            print(f"[DB Error during register] {db_err}")
            cursor.close()
            close_connection(conn)
            return jsonify({'error': f'Database error: {str(db_err)}'}), 500

        user_id = cursor.lastrowid
        cursor.close()
        close_connection(conn)

        # Generate token
        token = generate_token({'user_id': user_id, 'name': name, 'role': 'user'})

        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'user_id': user_id,
                'name': name,
                'role': 'user',
                'age': age,
                'smoking_status': smoking_status,
                'existing_conditions': existing_conditions
            },
            'token': token
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
        cursor.execute("SELECT user_id, name, email, password_hash, role, age, smoking_status, existing_conditions FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        cursor.close()
        close_connection(conn)

        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401

        if not check_password_hash(user['password_hash'], password):
            return jsonify({'error': 'Invalid email or password'}), 401

        # Generate token
        token = generate_token({
            'user_id': user['user_id'],
            'name': user['name'],
            'role': user['role']
        })

        return jsonify({
            'success': True,
            'user': {
                'user_id': user['user_id'],
                'name': user['name'],
                'role': user['role'],
                'age': user['age'],
                'smoking_status': user['smoking_status'],
                'existing_conditions': user['existing_conditions']
            },
            'token': token
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/api/user/update-profile', methods=['POST'])
@token_required
def update_profile():
    """Update user health profile details."""
    try:
        data = request.get_json()
        user_id = request.user.get('user_id') 
        
        # Hyper-defensive sanitization
        def clean_val(val, default=None):
            if val is None or str(val).strip() == '':
                return default
            return val

        age = clean_val(data.get('age'))
        if age is not None:
            try:
                age = int(age)
            except (ValueError, TypeError):
                return jsonify({'error': 'Age must be a valid number'}), 400
        
        smoking_status = clean_val(data.get('smoking_status'), 'no')
        if smoking_status not in ['yes', 'no']:
            smoking_status = 'no'
            
        existing_conditions = clean_val(data.get('existing_conditions'), '')

        if not user_id:
            return jsonify({'error': 'Unauthorized: Missing user ID in token'}), 401

        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)
        try:
            query = """
                UPDATE users 
                SET age = %s, smoking_status = %s, existing_conditions = %s
                WHERE user_id = %s
            """
            cursor.execute(query, (age, smoking_status, existing_conditions, user_id))
            conn.commit()
        except Exception as db_err:
            print(f"[DB Error during update-profile] {db_err}")
            cursor.close()
            close_connection(conn)
            return jsonify({'error': f'Database update failed: {str(db_err)}'}), 500
        
        # Fetch updated user for confirmation
        cursor.execute("SELECT user_id, name, email, role, age, smoking_status, existing_conditions FROM users WHERE user_id = %s", (user_id,))
        updated_user = cursor.fetchone()
        
        cursor.close()
        close_connection(conn)

        if not updated_user:
            return jsonify({'error': 'User not found after update'}), 404

        return jsonify({
            'message': 'Profile updated successfully',
            'user': updated_user
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
