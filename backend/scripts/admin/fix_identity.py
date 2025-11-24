#!/usr/bin/env python3
"""
Fix identity seed for Items table to prevent large jumps in IDs
"""

from .db_connection import get_db_connection

def fix_items_identity():
    """Reset the identity seed for Items table to continue from current max ID"""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        # Get current maximum item_id
        cursor.execute("SELECT MAX(item_id) FROM Items")
        max_id = cursor.fetchone()[0]
        
        if max_id is None:
            print("No items in table")
            return True
        
        print(f"Current maximum item_id: {max_id}")
        
        # Reset identity seed to continue from current max + 1
        cursor.execute(f"DBCC CHECKIDENT ('Items', RESEED, {max_id})")
        conn.commit()
        
        print(f"✅ Identity seed reset. Next item will have ID: {max_id + 1}")
        return True
        
    except Exception as e:
        print(f"❌ Error resetting identity: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    fix_items_identity()