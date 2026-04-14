from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

socketio = SocketIO()

def create_app():
    """Flask application factory."""
    app = Flask(__name__)
    
    # Enable CORS for React frontend (Vercel and Localhost)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register route blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.aqi_routes import aqi_bp
    from app.routes.health_routes import health_bp
    from app.routes.prediction_routes import prediction_bp
    from app.routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(aqi_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(admin_bp)

    # Initialize SocketIO with all origins allowed
    socketio.init_app(app, cors_allowed_origins="*")

    # Import socket events to register them
    with app.app_context():
        from app import socket_events

    return app
