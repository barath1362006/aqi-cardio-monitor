from flask import request
from flask_socketio import emit, join_room, leave_room
from app import socketio

@socketio.on('connect')
def handle_connect():
    print(f"[Socket] Client connected: {request.sid}")

@socketio.on('join')
def on_join(data):
    user_id = data.get('user_id')
    if user_id:
        room = f"user_{user_id}"
        join_room(room)
        print(f"[Socket] User {user_id} joined room {room}")
        emit('status', {'msg': f'Joined room {room}'})

@socketio.on('leave')
def on_leave(data):
    user_id = data.get('user_id')
    if user_id:
        room = f"user_{user_id}"
        leave_room(room)
        print(f"[Socket] User {user_id} left room {room}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"[Socket] Client disconnected: {request.sid}")
