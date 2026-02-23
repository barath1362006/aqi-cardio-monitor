from flask import Blueprint, request, jsonify
import requests
from config import Config
from app.db import get_connection, close_connection

aqi_bp = Blueprint('aqi', __name__)


def get_lat_lon(city):
    """Convert city name to latitude and longitude using OpenWeather Geocoding API."""
    url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={Config.OPENWEATHER_API_KEY}"
    response = requests.get(url)
    data = response.json()

    if not data:
        return None, None

    return data[0]['lat'], data[0]['lon']


@aqi_bp.route('/api/aqi/current', methods=['GET'])
def get_current_aqi():
    """Fetch current AQI data for a city from OpenWeather API."""
    try:
        city = request.args.get('city', 'Chennai')

        # Get lat/lon for the city
        lat, lon = get_lat_lon(city)
        if lat is None or lon is None:
            return jsonify({'error': f'Could not find coordinates for city: {city}'}), 404

        # Fetch air pollution data
        url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={Config.OPENWEATHER_API_KEY}"
        response = requests.get(url)
        data = response.json()

        if 'list' not in data or not data['list']:
            return jsonify({'error': 'No AQI data available'}), 404

        pollution = data['list'][0]
        aqi_value = pollution['main']['aqi']
        components = pollution['components']

        pm25 = components.get('pm2_5', 0)
        pm10 = components.get('pm10', 0)
        co = components.get('co', 0)
        no2 = components.get('no2', 0)
        o3 = components.get('o3', 0)

        # Save to database
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = conn.cursor()
        query = """
            INSERT INTO aqi_records (city, aqi_value, pm25, pm10, co, no2, o3)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (city, aqi_value, pm25, pm10, co, no2, o3))
        conn.commit()

        aqi_id = cursor.lastrowid
        cursor.close()
        close_connection(conn)

        return jsonify({
            'aqi_id': aqi_id,
            'city': city,
            'aqi_value': aqi_value,
            'pm25': pm25,
            'pm10': pm10,
            'co': co,
            'no2': no2,
            'o3': o3
        }), 200

    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'API request failed: {str(e)}'}), 502
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@aqi_bp.route('/api/aqi/history', methods=['GET'])
def get_aqi_history():
    """Fetch AQI history from the database for the last N days."""
    try:
        days = request.args.get('days', 7, type=int)

        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT aqi_id, city, aqi_value, pm25, pm10, co, no2, o3, fetched_at
            FROM aqi_records
            WHERE fetched_at >= DATE_SUB(NOW(), INTERVAL %s DAY)
            ORDER BY fetched_at DESC
        """
        cursor.execute(query, (days,))
        records = cursor.fetchall()

        cursor.close()
        close_connection(conn)

        # Convert datetime objects to strings for JSON serialization
        for record in records:
            record['fetched_at'] = record['fetched_at'].isoformat() if record['fetched_at'] else None

        return jsonify(records), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
