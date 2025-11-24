#!/usr/bin/env python3
"""
Test script for authentication and database connection
"""

import sys
import os

# Add the admin directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'admin'))

from admin.auth import setup_admin, authenticate_admin, change_admin_password
from admin.db_connection import test_connection, get_db_connection

def main():
    """Test authentication and database connection"""
    print("🧪 Testing Authentication & Database Connection")
    print("=" * 50)
    
    # Step 1: Check if admin credentials exist
    credentials_file = "admin_credentials.json"
    if not os.path.exists(credentials_file):
        print("Step 1: First-time admin setup")
        if not setup_admin():
            print("❌ Setup failed!")
            return
    else:
        print("✅ Admin credentials file exists")
    
    # Step 2: Test authentication
    print("\nStep 2: Testing authentication")
    if authenticate_admin():
        print("✅ Authentication successful!")
    else:
        print("❌ Authentication failed!")
        return
    
    # Step 3: Test database connection
    print("\nStep 3: Testing database connection")
    if test_connection():
        print("✅ Database connection test passed!")
    else:
        print("❌ Database connection test failed!")
        return
    
    print("\n🎉 All tests passed! Authentication and database are working correctly.")

if __name__ == "__main__":
    main()