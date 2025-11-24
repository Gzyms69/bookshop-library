#!/usr/bin/env python3
"""
Item creation functionality for admin panel
"""

import os
import sys
# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from admin.db_connection import get_db_connection
from .item_listing import get_item_types

def add_new_item():
    """Add a new item to the database"""
    print("\n➕ ADD NEW ITEM")
    print("=" * 40)
    
    # Get available item types
    item_types = get_item_types()
    if not item_types:
        print("❌ No item types available.")
        return False
    
    try:
        # Get item details
        title = input("\nItem title: ").strip()
        if not title:
            print("❌ Title is required!")
            return False
            
        author_director = input("Author/Director: ").strip()
        item_type_id = int(input("Item type ID: "))
        purchase_price = float(input("Purchase price: $"))
        rental_price = float(input("Rental price per day: $"))
        total_copies = int(input("Total copies: "))
        
        # Validate item type
        valid_type_ids = [t[0] for t in item_types]
        if item_type_id not in valid_type_ids:
            print("❌ Invalid item type ID!")
            return False
        
        conn = get_db_connection()
        if not conn:
            return False
        
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Items (title, author_director, item_type_id, purchase_price, 
                             rental_price_per_day, total_copies, available_copies)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (title, author_director, item_type_id, purchase_price, 
              rental_price, total_copies, total_copies))
        
        conn.commit()
        print("✅ Item added successfully!")
        
        # Show the newly added item
        cursor.execute("SELECT MAX(item_id) FROM Items")
        new_item_id = cursor.fetchone()[0]
        print(f"📝 New item ID: {new_item_id}")
        
        conn.close()
        return True
        
    except ValueError:
        print("❌ Invalid input! Please enter numbers for prices and quantities.")
        return False
    except Exception as e:
        print(f"❌ Error adding item: {e}")
        return False

if __name__ == "__main__":
    add_new_item()