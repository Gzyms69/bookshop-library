#!/usr/bin/env python3
"""
Comprehensive health check for the BookShop Library system
Run with: python scripts/health_check.py
"""

import pymssql
import requests
import sys

def check_database():
    """Check database connectivity and data"""
    try:
        conn = pymssql.connect(
            server='localhost',
            port=1433,
            user='sa', 
            password='MyStrongPassword123!',
            database='BookShopLibrary'
        )
        
        cursor = conn.cursor()
        
        print("🔍 Database Health Check")
        print("=" * 30)
        
        # Check table counts
        tables = ['Items', 'Users', 'ItemTypes']
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"✅ {table}: {count} rows")
        
        # Test the main query
        cursor.execute("""
            SELECT i.*, t.type_name 
            FROM Items i 
            JOIN ItemTypes t ON i.item_type_id = t.type_id
        """)
        items = cursor.fetchall()
        print(f"✅ JOIN Query: {len(items)} items returned")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Database check failed: {e}")
        return False

def check_api():
    """Check API endpoints"""
    print("\n🌐 API Health Check")
    print("=" * 30)
    
    endpoints = [
        ("/", "API root"),
        ("/health", "Health endpoint"),
        ("/items", "Items endpoint"),
        ("/analytics/pricing", "Analytics endpoint")
    ]
    
    all_ok = True
    for endpoint, description in endpoints:
        try:
            response = requests.get(f"http://localhost:8000{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"✅ {description}: HTTP {response.status_code}")
            else:
                print(f"❌ {description}: HTTP {response.status_code}")
                all_ok = False
        except Exception as e:
            print(f"❌ {description}: {e}")
            all_ok = False
    
    return all_ok

if __name__ == "__main__":
    print("🏥 BookShop Library System Health Check")
    print("=" * 50)
    
    db_ok = check_database()
    api_ok = check_api()
    
    print("\n" + "=" * 50)
    if db_ok and api_ok:
        print("🎉 ALL SYSTEMS GO! Everything is working correctly.")
    else:
        print("⚠️  Some checks failed. Review the errors above.")
        sys.exit(1)