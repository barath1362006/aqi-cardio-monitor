import mysql.connector
from mysql.connector import Error
from config import Config


def get_connection():
    """Create and return a MySQL database connection."""
    try:
        connection = mysql.connector.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"[DB ERROR] Failed to connect to MySQL: {e}")
        return None


def close_connection(connection):
    """Close the MySQL database connection."""
    try:
        if connection and connection.is_connected():
            connection.close()
    except Error as e:
        print(f"[DB ERROR] Failed to close connection: {e}")


if __name__ == "__main__":
    # Quick test to verify database connection
    conn = get_connection()
    if conn:
        cursor = conn.cursor()
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print("Connected successfully! Tables in database:")
        for table in tables:
            print(f"  - {table[0]}")
        cursor.close()
        close_connection(conn)
    else:
        print("Failed to connect to the database.")
