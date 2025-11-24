#!/usr/bin/env python3
"""
Admin authentication system for BookShop Library
"""

import getpass
import hashlib
import json
import os

ADMIN_CREDENTIALS_FILE = "admin_credentials.json"

def setup_admin():
    """Initial admin setup - run this once"""
    print("🔐 Initial Admin Setup")
    print("=" * 30)
    
    username = input("Enter admin username: ").strip()
    if not username:
        print("❌ Username cannot be empty!")
        return False
    
    password = getpass.getpass("Enter admin password: ")
    if not password:
        print("❌ Password cannot be empty!")
        return False
    
    # Hash the password
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    credentials = {
        "username": username,
        "password_hash": hashed_password
    }
    
    try:
        with open(ADMIN_CREDENTIALS_FILE, 'w') as f:
            json.dump(credentials, f, indent=2)
        
        print("✅ Admin credentials saved successfully!")
        return True
    except Exception as e:
        print(f"❌ Error saving credentials: {e}")
        return False

def authenticate_admin():
    """Authenticate admin user"""
    if not os.path.exists(ADMIN_CREDENTIALS_FILE):
        print("❌ No admin credentials found. Please run setup first.")
        return False
    
    try:
        with open(ADMIN_CREDENTIALS_FILE, 'r') as f:
            credentials = json.load(f)
        
        print("🔐 Admin Login")
        print("=" * 20)
        
        username = input("Username: ").strip()
        password = getpass.getpass("Password: ")
        
        hashed_input = hashlib.sha256(password.encode()).hexdigest()
        
        if (username == credentials["username"] and 
            hashed_input == credentials["password_hash"]):
            print("✅ Authentication successful!")
            return True
        else:
            print("❌ Invalid credentials!")
            return False
            
    except Exception as e:
        print(f"❌ Error during authentication: {e}")
        return False

def change_admin_password():
    """Change admin password"""
    print("🔐 Change Admin Password")
    print("=" * 30)
    return setup_admin()  # Reuse the setup function

if __name__ == "__main__":
    # Test the authentication system
    if not os.path.exists(ADMIN_CREDENTIALS_FILE):
        print("First-time setup required.")
        setup_admin()
    else:
        if authenticate_admin():
            print("Access granted!")
        else:
            print("Access denied!")