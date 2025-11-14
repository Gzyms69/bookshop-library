import pymssql

def create_missing_tables():
    try:
        conn = pymssql.connect(
            server='localhost',
            port=1433,
            user='sa', 
            password='MyStrongPassword123!',
            database='BookShopLibrary',
            autocommit=True
        )
        
        cursor = conn.cursor()
        
        # Check if ItemTypes table exists
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'ItemTypes'
        """)
        
        if cursor.fetchone()[0] == 0:
            print("Creating ItemTypes table...")
            cursor.execute("""
                CREATE TABLE ItemTypes (
                    type_id INT PRIMARY KEY IDENTITY(1,1),
                    type_name NVARCHAR(50) NOT NULL UNIQUE,
                    description NVARCHAR(255)
                )
            """)
            print("✅ ItemTypes table created!")
        else:
            print("✅ ItemTypes table already exists")
        
        # Add some sample item types
        cursor.execute("DELETE FROM ItemTypes")  # Clear any existing data
        
        item_types = [
            ('book', 'Physical books and novels'),
            ('magazine', 'Periodical publications'),
            ('movie', 'DVDs and Blu-ray films'),
            ('board_game', 'Tabletop games and puzzles')
        ]
        
        for item_type in item_types:
            cursor.execute("INSERT INTO ItemTypes (type_name, description) VALUES (%s, %s)", item_type)
        
        print("✅ Sample item types added!")
        
        # Check if Items table has the foreign key constraint
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Items' AND COLUMN_NAME = 'item_type_id'
        """)
        
        if cursor.fetchone()[0] == 0:
            print("Adding item_type_id to Items table...")
            cursor.execute("ALTER TABLE Items ADD item_type_id INT")
            print("✅ item_type_id column added to Items table")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    create_missing_tables()