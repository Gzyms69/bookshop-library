#!/usr/bin/env python3
"""
Admin Panel for BookShop Library Management System
"""

import sys
import os

# Add the admin directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'admin'))

from auth import setup_admin, authenticate_admin, change_admin_password, is_logged_in, logout
from db_connection import get_db_connection, test_connection
from item_listing import list_all_items
from item_creation import create_new_item
from fix_identity import fix_items_identity

def show_menu():
    """Display the admin menu"""
    print("\n📊 BookShop Library Admin Panel")
    print("=" * 40)
    print("1. List all items")
    print("2. Add new item") 
    print("3. Fix item ID sequencing")
    print("4. Test database connection")
    print("5. Change admin password")
    print("6. Logout")
    print("7. Exit")
    print("=" * 40)

def main():
    """Main admin panel function"""
    print("🔐 Admin Authentication")
    print("=" * 30)
    
    # Check if admin credentials exist
    credentials_file = "admin_credentials.json"
    if not os.path.exists(credentials_file):
        print("First-time admin setup required:")
        if not setup_admin():
            print("❌ Setup failed!")
            return
    else:
        print("✅ Admin credentials file exists")
    
    # Authenticate
    if not authenticate_admin():
        print("❌ Authentication failed!")
        return
    
    print("✅ Authentication successful!")
    
    # Main menu loop
    while True:
        show_menu()
        choice = input("\nEnter your choice (1-7): ").strip()
        
        if choice == '1':
            print("\n📦 Item Listing")
            print("=" * 30)
            list_all_items()
            
        elif choice == '2':
            print("\n➕ Add New Item")
            print("=" * 30)
            create_new_item()
            
        elif choice == '3':
            print("\n🔧 Fixing Item ID Sequencing")
            print("=" * 30)
            if fix_items_identity():
                print("✅ Item ID sequencing fixed!")
            else:
                print("❌ Failed to fix item ID sequencing")
                
        elif choice == '4':
            print("\n🔌 Testing Database Connection")
            print("=" * 30)
            if test_connection():
                print("✅ Database connection test passed!")
            else:
                print("❌ Database connection test failed!")
                
        elif choice == '5':
            print("\n🔐 Change Admin Password")
            print("=" * 30)
            if change_admin_password():
                print("✅ Admin password changed successfully!")
            else:
                print("❌ Failed to change admin password")
                
        elif choice == '6':
            logout()
            print("✅ Logged out successfully!")
            # Re-authenticate
            print("\n🔐 Re-authentication required:")
            if not authenticate_admin():
                print("❌ Authentication failed! Exiting...")
                return
            print("✅ Authentication successful!")
            
        elif choice == '7':
            print("👋 Goodbye!")
            break
            
        else:
            print("❌ Invalid choice. Please enter 1-7.")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    main()