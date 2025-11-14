import pymssql

def add_sample_data():
    try:
        conn = pymssql.connect(
            server='localhost',
            port=1433,
            user='sa', 
            password='MyStrongPassword123!',
            database='BookShopLibrary'
        )
        
        cursor = conn.cursor()
        
        # First, let's see what item types we have and their IDs
        cursor.execute("SELECT type_id, type_name FROM ItemTypes")
        item_types = {name: id for id, name in cursor.fetchall()}
        print("Available item types:", item_types)
        
        # Add sample items with correct item_type_id
        sample_items = [
            ('The Great Gatsby', 'F. Scott Fitzgerald', item_types['book'], 8.99, 0.50, 5, 5),
            ('Dune', 'Frank Herbert', item_types['book'], 9.99, 0.75, 3, 3),
            ('The Shawshank Redemption', 'Frank Darabont', item_types['movie'], 12.99, 1.25, 4, 4),
            ('Catan', 'Klaus Teuber', item_types['board_game'], 35.99, 2.50, 2, 2),
            ('National Geographic', 'Various', item_types['magazine'], 4.99, 0.25, 10, 10)
        ]
        
        for item in sample_items:
            cursor.execute("""
                INSERT INTO Items (title, author_director, item_type_id, purchase_price, rental_price_per_day, total_copies, available_copies)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, item)
        
        # Add sample users
        sample_users = [
            ('John', 'Doe', 'john.doe@email.com'),
            ('Jane', 'Smith', 'jane.smith@email.com'),
            ('Bob', 'Johnson', 'bob.johnson@email.com')
        ]
        
        for user in sample_users:
            cursor.execute("""
                INSERT INTO Users (first_name, last_name, email)
                VALUES (%s, %s, %s)
            """, user)
        
        conn.commit()
        conn.close()
        print("✅ Sample data added successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error adding sample data: {e}")
        return False

if __name__ == "__main__":
    add_sample_data()