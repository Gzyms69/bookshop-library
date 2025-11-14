import pymssql

def verify_simple():
    try:
        conn = pymssql.connect(
            server='localhost',
            port=1433,
            user='sa', 
            password='MyStrongPassword123!',
            database='BookShopLibrary'
        )
        
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("""
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        """)
        
        tables = cursor.fetchall()
        print("✅ Tables in database:")
        for table in tables:
            print(f"   - {table[0]}")
        
        # Add sample data
        cursor.execute("INSERT INTO ItemTypes (type_name, description) VALUES ('book', 'Physical books')")
        cursor.execute("INSERT INTO ItemTypes (type_name, description) VALUES ('movie', 'DVDs and Blu-rays')")
        conn.commit()
        
        # Show item types
        cursor.execute("SELECT * FROM ItemTypes")
        item_types = cursor.fetchall()
        print("✅ Item Types:")
        for item_type in item_types:
            print(f"   - {item_type[1]}: {item_type[2]}")
        
        conn.close()
        print("🎉 Simple setup verified successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    verify_simple()