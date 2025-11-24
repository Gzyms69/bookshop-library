#!/usr/bin/env python3
"""
Database connection helper for admin scripts
"""

import pymssql

def get_db_connection():
    """Get database connection for admin operations"""
    try:
        conn = pymssql.connect(
            server='localhost',
            port=1433,
            user='sa',
            password='MyStrongPassword123!',
            database='BookShopLibrary'
        )
        print("✅ Database connection successful!")
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return None

def test_connection():
    """Test the database connection and basic operations"""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        # Test basic queries
        cursor.execute("SELECT COUNT(*) FROM Items")
        item_count = cursor.fetchone()[0]
        print(f"📦 Items in database: {item_count}")
        
        cursor.execute("SELECT COUNT(*) FROM Users")
        user_count = cursor.fetchone()[0]
        print(f"👥 Users in database: {user_count}")
        
        cursor.execute("SELECT COUNT(*) FROM ItemTypes")
        type_count = cursor.fetchone()[0]
        print(f"📑 Item types in database: {type_count}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error testing database: {e}")
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    test_connection()