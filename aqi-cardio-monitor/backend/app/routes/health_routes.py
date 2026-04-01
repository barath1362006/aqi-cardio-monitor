from flask import Blueprint, request, jsonify
from app.db import get_connection, close_connection
from app.auth_utils import token_required

health_bp = Blueprint('health', __name__)


@health_bp.route('/api/health/submit', methods=['POST'])
@token_required
def submit_health_data():
    """Submit a new health record for a user."""
    try:
        data = request.get_json()
        user_id = request.user.get('user_id')
        
        print(f"DEBUG: user_id={user_id}, type={type(user_id)}")
        
        heart_rate = data.get('heart_rate')
        systolic_bp = data.get('systolic_bp')
        diastolic_bp = data.get('diastolic_bp')

        if not all([heart_rate, systolic_bp, diastolic_bp]):
            return jsonify({'error': 'All health metrics are required'}), 400
            
        # Validate positive numbers (retained from original, not explicitly removed by instruction)
        try:
            heart_rate = int(heart_rate)
            systolic_bp = int(systolic_bp)
            diastolic_bp = int(diastolic_bp)
        except (ValueError, TypeError):
            return jsonify({'error': 'Health values must be valid numbers'}), 400

        if heart_rate <= 0 or systolic_bp <= 0 or diastolic_bp <= 0:
            return jsonify({'error': 'Health values must be positive numbers'}), 400

        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        query = """
            INSERT INTO health_records (user_id, heart_rate, systolic_bp, diastolic_bp)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (user_id, heart_rate, systolic_bp, diastolic_bp))
        conn.commit()

        cursor.close()
        close_connection(conn)
        
        return jsonify({'message': 'Health data submitted successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@health_bp.route('/api/health/history', methods=['GET'])
@token_required
def get_health_history():
    """Fetch all health records for a given user."""
    try:
        user_id = request.user.get('user_id')

        if not user_id:
            return jsonify({'error': 'Unauthorized: Missing user_id in token'}), 401

        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT record_id, user_id, heart_rate, systolic_bp, diastolic_bp, recorded_at
            FROM health_records
            WHERE user_id = %s
            ORDER BY recorded_at DESC
        """
        cursor.execute(query, (user_id,))
        records = cursor.fetchall()

        cursor.close()
        close_connection(conn)

        # Convert datetime objects to strings
        for record in records:
            record['recorded_at'] = record['recorded_at'].isoformat() if record['recorded_at'] else None

        return jsonify(records), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
