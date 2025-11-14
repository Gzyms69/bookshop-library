import pymssql

def create_database():
    try:
        print("Creating BookShopLibrary database...")
        
        # Connect to master database first with autocommit for DDL statements
        conn = pymssql.connect(
            server='localhost',
            port=1433,
            user='sa', 
            password='MyStrongPassword123!',
            database='master',
            autocommit=True  # This is crucial for CREATE DATABASE
        )
        
        cursor = conn.cursor()
        
        # Check if database already exists
        cursor.execute("SELECT name FROM sys.databases WHERE name = 'BookShopLibrary'")
        if cursor.fetchone():
            print("✅ Database already exists")
            conn.close()
            return True
        
        # Create database
        cursor.execute("CREATE DATABASE BookShopLibrary")
        print("✅ Database created successfully!")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False

def run_schema():
    try:
        print("Creating database tables...")
        
        # Now connect to our new database
        conn = pymssql.connect(
            server='localhost',
            port=1433,
            user='sa', 
            password='MyStrongPassword123!',
            database='BookShopLibrary',
            autocommit=True  # Also important for schema creation
        )
        
        cursor = conn.cursor()
        
        # Read the schema file
        with open('../database/simple_schema.sql', 'r') as file:
            schema_sql = file.read()
        
        # Split by semicolons and execute each statement
        statements = [stmt.strip() for stmt in schema_sql.split(';') if stmt.strip()]
        
        for i, statement in enumerate(statements, 1):
            if statement and not statement.startswith('--'):  # Skip empty lines and comments
                try:
                    cursor.execute(statement)
                    print(f"✅ Executed statement {i}/{len(statements)}")
                except Exception as e:
                    print(f"⚠️  Warning on statement {i}: {e}")
                    # Continue with other statements
        
        print("✅ Database schema created successfully!")
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error creating schema: {e}")
        return False

if __name__ == "__main__":
    if create_database():
        run_schema()