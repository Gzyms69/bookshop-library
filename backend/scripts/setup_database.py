#!/usr/bin/env python3
"""
Database setup and reset script for BookShop Library
Run with: python scripts/setup_database.py
"""

import pymssql
import os
import sys

def run_sql_file(conn, filepath, description):
    """Execute SQL commands from a file"""
    try:
        cursor = conn.cursor()
        with open(filepath, 'r') as file:
            sql_script = file.read()
        
        # Split by GO statements or semicolons
        statements = [stmt.strip() for stmt in sql_script.split('GO') if stmt.strip()]
        
        print(f"📁 {description}...")
        for i, statement in enumerate(statements, 1):
            if statement and not statement.startswith('--'):
                try:
                    cursor.execute(statement)
                    print(f"   ✅ Executed statement {i}")
                except Exception as e:
                    print(f"   ⚠️  Statement {i} skipped: {e}")
        
        conn.commit()
        return True
    except Exception as e:
        print(f"❌ Error in {description}: {e}")
        return False

def setup_database():
    """Main setup function"""
    print("🚀 BookShop Library Database Setup")
    print("=" * 40)
    
    try:
        # Connect to master database first
        conn = pymssql.connect(
            server='localhost',
            port=1433,
            user='sa', 
            password='MyStrongPassword123!',
            database='master',
            autocommit=True
        )
        
        cursor = conn.cursor()
        
        # Create database if it doesn't exist
        cursor.execute("""
            IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'BookShopLibrary')
            CREATE DATABASE BookShopLibrary
        """)
        print("✅ Database checked/created")
        
        conn.close()
        
        # Now connect to our database
        conn = pymssql.connect(
            server='localhost',
            port=1433,
            user='sa', 
            password='MyStrongPassword123!',
            database='BookShopLibrary',
            autocommit=True
        )
        
        # Get absolute paths to SQL files
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        schema_path = os.path.join(base_dir, '..', 'database', 'schema.sql')
        sample_data_path = os.path.join(base_dir, '..', 'database', 'sample_data.sql')
        
        # Run schema and sample data
        if run_sql_file(conn, schema_path, "Creating database schema"):
            print("🎉 Schema created successfully!")
        
        if run_sql_file(conn, sample_data_path, "Inserting sample data"):
            print("🎉 Sample data inserted successfully!")
        
        # Verify setup
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM Items")
        item_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM Users")
        user_count = cursor.fetchone()[0]
        
        print(f"\n📊 Setup Verification:")
        print(f"   - Items: {item_count}")
        print(f"   - Users: {user_count}")
        
        conn.close()
        print("\n✅ Database setup completed!")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    setup_database()