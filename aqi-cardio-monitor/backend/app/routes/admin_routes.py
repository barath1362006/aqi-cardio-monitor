from flask import Blueprint, request, jsonify
from app.db import get_connection, close_connection
from app.auth_utils import token_required

admin_bp = Blueprint('admin', __name__)


def check_admin_role(required_roles=('admin', 'superadmin')):
    """Check if the requesting user has admin privileges."""
    if not hasattr(request, 'user'):
        return False
    role = request.user.get('role', '')
    if role not in required_roles:
        return False
    return True


@admin_bp.route('/api/admin/users', methods=['GET'])
@token_required
def get_all_users():
    """Get a list of all users (admin/superadmin only)."""
    try:
        if not check_admin_role():
            return jsonify({'error': 'Access denied. Admin role required.'}), 403

        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT user_id, name, email, age, smoking_status, existing_conditions, role, created_at
            FROM users
            ORDER BY created_at DESC
        """
        cursor.execute(query)
        users = cursor.fetchall()

        cursor.close()
        close_connection(conn)

        # Convert datetime objects
        for user in users:
            user['created_at'] = user['created_at'].isoformat() if user['created_at'] else None

        return jsonify(users), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/api/admin/records', methods=['GET'])
@token_required
def get_all_records():
    """Get all health records with user names (admin/superadmin only)."""
    try:
        if not check_admin_role():
            return jsonify({'error': 'Access denied. Admin role required.'}), 403

        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT hr.record_id, hr.user_id, u.name AS user_name, 
                   hr.heart_rate, hr.systolic_bp, hr.diastolic_bp, hr.recorded_at
            FROM health_records hr
            JOIN users u ON hr.user_id = u.user_id
            ORDER BY hr.recorded_at DESC
        """
        cursor.execute(query)
        records = cursor.fetchall()

        cursor.close()
        close_connection(conn)

        for record in records:
            record['recorded_at'] = record['recorded_at'].isoformat() if record['recorded_at'] else None

        return jsonify(records), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(user_id):
    """Delete a user and all related records (superadmin only)."""
    try:
        if not check_admin_role(required_roles=('superadmin',)):
            return jsonify({'error': 'Access denied. Superadmin role required.'}), 403

        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)

        # Check if user exists
        cursor.execute("SELECT user_id, name FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            cursor.close()
            close_connection(conn)
            return jsonify({'error': 'User not found'}), 404

        # Delete user (CASCADE will handle related records)
        cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
        conn.commit()

        cursor.close()
        close_connection(conn)

        return jsonify({
            'message': f'User {user["name"]} (ID: {user_id}) deleted successfully'
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
