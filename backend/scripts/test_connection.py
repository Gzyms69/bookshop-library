import pymssql

def test_docker_connection():
    try:
        print("Testing connection to SQL Server...")
        
        conn = pymssql.connect(
            server='localhost',
            port=1433,
            user='sa', 
            password='MyStrongPassword123!',
            database='master'
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT @@VERSION AS version")
        row = cursor.fetchone()
        
        print("🎉 SUCCESS! Connected to SQL Server")
        print(f"Version: {row[0][:100]}...")
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    test_docker_connection()