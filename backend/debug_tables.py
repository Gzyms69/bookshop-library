import pymssql

def debug_tables():
    try:
        conn = pymssql.connect(
            server='localhost',
            port=1433,
            user='sa', 
            password='MyStrongPassword123!',
            database='BookShopLibrary'
        )
        
        cursor = conn.cursor()
        
        # Get all tables and their columns
        cursor.execute("""
            SELECT 
                t.name AS table_name,
                c.name AS column_name,
                ty.name AS data_type,
                c.max_length,
                c.is_nullable
            FROM sys.tables t
            INNER JOIN sys.columns c ON t.object_id = c.object_id
            INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
            ORDER BY t.name, c.column_id
        """)
        
        tables = {}
        for row in cursor.fetchall():
            table_name = row[0]
            if table_name not in tables:
                tables[table_name] = []
            tables[table_name].append({
                'column': row[1],
                'type': row[2],
                'max_length': row[3],
                'nullable': row[4]
            })
        
        print("📊 Current database structure:")
        for table_name, columns in tables.items():
            print(f"\n{table_name}:")
            for col in columns:
                print(f"  - {col['column']} ({col['type']})")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    debug_tables()