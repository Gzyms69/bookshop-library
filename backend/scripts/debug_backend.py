import pymssql

def debug_backend_query():
    """Run the exact same query that your backend should be running"""
    try:
        conn = pymssql.connect(
            server='localhost',
            port=1433,
            user='sa',
            password='MyStrongPassword123!',
            database='BookShopLibrary'
        )
        
        cursor = conn.cursor()
        
        print("🔍 DEBUGGING BACKEND QUERY")
        print("=" * 40)
        
        # Try the exact query from the backend
        query = """
            SELECT i.*, t.type_name 
            FROM Items i 
            JOIN ItemTypes t ON i.item_type_id = t.type_id
        """
        
        print(f"Running query: {query}")
        cursor.execute(query)
        
        items = cursor.fetchall()
        columns = [column[0] for column in cursor.description]
        
        print(f"Found {len(items)} items")
        print("Columns:", columns)
        
        for i, item in enumerate(items):
            print(f"Item {i+1}: {dict(zip(columns, item))}")
        
        conn.close()
        return len(items)
        
    except Exception as e:
        print(f"❌ Query failed: {e}")
        return 0

if __name__ == "__main__":
    debug_backend_query()