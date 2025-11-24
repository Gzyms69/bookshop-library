#!/usr/bin/env python3
"""
Item listing functionality for admin panel
"""

import os
import sys
# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from admin.db_connection import get_db_connection

def list_all_items():
    """List all items in a formatted table"""
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT i.item_id, i.title, i.author_director, t.type_name, 
                   i.purchase_price, i.rental_price_per_day, 
                   i.total_copies, i.available_copies,
                   i.created_date
            FROM Items i 
            JOIN ItemTypes t ON i.item_type_id = t.type_id
            ORDER BY i.item_id
        """)
        
        items = cursor.fetchall()
        columns = [column[0] for column in cursor.description]
        
        print("\n📦 ALL ITEMS IN DATABASE")
        print("=" * 100)
        print(f"{'ID':<4} {'Title':<25} {'Author/Director':<20} {'Type':<12} {'Price':<8} {'Rental':<8} {'Stock':<10} {'Created'}")
        print("-" * 100)
        
        for item in items:
            item_dict = dict(zip(columns, item))
            print(f"{item_dict['item_id']:<4} {item_dict['title'][:23]:<25} {item_dict['author_director'][:18]:<20} "
                  f"{item_dict['type_name']:<12} ${item_dict['purchase_price']:<7} ${item_dict['rental_price_per_day']:<7} "
                  f"{item_dict['available_copies']}/{item_dict['total_copies']:<8} {item_dict['created_date'].strftime('%m/%d/%Y')}")
        
        print(f"\n📊 Total items: {len(items)}")
        return items
        
    except Exception as e:
        print(f"❌ Error listing items: {e}")
        return []
    finally:
        conn.close()

def get_item_types():
    """Get all available item types for forms"""
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT type_id, type_name FROM ItemTypes ORDER BY type_name")
        item_types = cursor.fetchall()
        
        print("\n📑 Available Item Types:")
        for type_id, type_name in item_types:
            print(f"  {type_id}: {type_name}")
            
        return item_types
        
    except Exception as e:
        print(f"❌ Error fetching item types: {e}")
        return []
    finally:
        conn.close()

if __name__ == "__main__":
    # Test the listing functionality
    list_all_items()
    get_item_types()