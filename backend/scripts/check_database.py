import pymssql

def check_database():
    try:
        conn = pymssql.connect(
            server='localhost',
            port=1433,
            user='sa', 
            password='MyStrongPassword123!',
            database='BookShopLibrary'
        )
        
        cursor = conn.cursor()
        
        print("🔍 DATABASE DIAGNOSTICS")
        print("=" * 50)
        
        # Check current database
        cursor.execute("SELECT DB_NAME()")
        current_db = cursor.fetchone()[0]
        print(f"Current database: {current_db}")
        
        # Check tables and row counts
        tables = ['Items', 'Users', 'ItemTypes', 'Transactions', 'Fines', 'InventoryAudit']
        
        for table in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"📦 {table}: {count} rows")
                
                if count > 0 and table in ['Items', 'Users', 'ItemTypes']:
                    cursor.execute(f"SELECT TOP 3 * FROM {table}")
                    rows = cursor.fetchall()
                    columns = [column[0] for column in cursor.description]
                    print(f"   Sample data:")
                    for row in rows[:2]:  # Show first 2 rows
                        print(f"     - {dict(zip(columns, row))}")
            except Exception as e:
                print(f"⚠️  Could not read {table}: {e}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

if __name__ == "__main__":
    check_database()