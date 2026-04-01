from app.db import get_connection, close_connection
import json

def dump_data():
    conn = get_connection()
    if not conn:
        print("Failed to connect")
        return
    
    cursor = conn.cursor(dictionary=True)
    
    print("--- Health Records ---")
    cursor.execute("SELECT * FROM health_records ORDER BY recorded_at DESC LIMIT 10")
    print(json.dumps(cursor.fetchall(), indent=2, default=str))
    
    print("\n--- AQI Records ---")
    cursor.execute("SELECT * FROM aqi_records ORDER BY fetched_at DESC LIMIT 10")
    print(json.dumps(cursor.fetchall(), indent=2, default=str))
    
    cursor.close()
    close_connection(conn)

if __name__ == "__main__":
    dump_data()
