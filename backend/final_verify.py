import pymssql

def final_verify():
    try:
        conn = pymssql.connect(
            server='localhost',
            port=1433,
            user='sa', 
            password='MyStrongPassword123!',
            database='BookShopLibrary'
        )
        
        cursor = conn.cursor()
        
        print("🎯 Final Verification Results:")
        
        # Check tables
        cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES ORDER BY TABLE_NAME")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"✅ Tables: {', '.join(tables)}")
        
        # Check item types
        cursor.execute("SELECT type_name, description FROM ItemTypes")
        print("✅ Item Types:")
        for row in cursor.fetchall():
            print(f"   - {row[0]}: {row[1]}")
        
        # Check items
        cursor.execute("""
            SELECT i.title, i.author_director, t.type_name, i.purchase_price, i.rental_price_per_day 
            FROM Items i 
            JOIN ItemTypes t ON i.item_type_id = t.type_id
        """)
        print("✅ Sample Items:")
        for row in cursor.fetchall():
            print(f"   - {row[0]} by {row[1]} ({row[2]}) - Buy: ${row[3]}, Rent: ${row[4]}/day")
        
        # Check users
        cursor.execute("SELECT first_name, last_name, email FROM Users")
        print("✅ Sample Users:")
        for row in cursor.fetchall():
            print(f"   - {row[0]} {row[1]} ({row[2]})")
        
        conn.close()
        print("\n🎉 Database setup completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False

if __name__ == "__main__":
    final_verify()