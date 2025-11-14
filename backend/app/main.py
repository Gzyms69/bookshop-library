from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pymssql
from typing import List, Optional
import statistics

app = FastAPI(
    title="BookShop Library API",
    description="A hybrid bookshop and library management system",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection function
def get_db_connection():
    return pymssql.connect(
        server='localhost',
        port=1433,
        user='sa',
        password='MyStrongPassword123!',
        database='BookShopLibrary'
    )

@app.get("/")
def read_root():
    return {
        "message": "BookShop Library API is running!",
        "endpoints": {
            "items": "/items",
            "users": "/users", 
            "analytics": "/analytics",
            "health": "/health"
        }
    }

@app.get("/health")
def health_check():
    """Check database connectivity and basic stats"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Count tables, items, and users
        cursor.execute("SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
        table_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM Items")
        item_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM Users") 
        user_count = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "status": "healthy",
            "table_count": table_count,
            "total_items": item_count,
            "total_users": user_count
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.get("/items")
def get_items(item_type: Optional[str] = None):
    """Get all items, optionally filtered by type"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if item_type:
            cursor.execute("""
                SELECT i.*, t.type_name 
                FROM Items i 
                JOIN ItemTypes t ON i.item_type_id = t.type_id 
                WHERE t.type_name = %s
            """, (item_type,))
        else:
            cursor.execute("""
                SELECT i.*, t.type_name 
                FROM Items i 
                JOIN ItemTypes t ON i.item_type_id = t.type_id
            """)
        
        items = cursor.fetchall()
        columns = [column[0] for column in cursor.description]
        result = [dict(zip(columns, row)) for row in items]
        
        conn.close()
        return {"items": result, "count": len(result)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/items/{item_id}")
def get_item(item_id: int):
    """Get a specific item by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT i.*, t.type_name, t.description as type_description
            FROM Items i 
            JOIN ItemTypes t ON i.item_type_id = t.type_id
            WHERE i.item_id = %s
        """, (item_id,))
        
        item = cursor.fetchone()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        columns = [column[0] for column in cursor.description]
        result = dict(zip(columns, item))
        
        conn.close()
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users")
def get_users():
    """Get all users"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM Users")
        users = cursor.fetchall()
        columns = [column[0] for column in cursor.description]
        result = [dict(zip(columns, row)) for row in users]
        
        conn.close()
        return {"users": result, "count": len(result)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Analytics endpoints - where your math background shines!
@app.get("/analytics/pricing")
def get_pricing_analytics():
    """Statistical analysis of item pricing"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all pricing data
        cursor.execute("SELECT purchase_price, rental_price_per_day FROM Items WHERE purchase_price IS NOT NULL")
        prices = cursor.fetchall()
        
        purchase_prices = [row[0] for row in prices if row[0] is not None]
        rental_prices = [row[1] for row in prices if row[1] is not None]
        
        # Basic statistics
        stats = {
            "purchase_prices": {
                "count": len(purchase_prices),
                "mean": statistics.mean(purchase_prices) if purchase_prices else 0,
                "median": statistics.median(purchase_prices) if purchase_prices else 0,
                "std_dev": statistics.stdev(purchase_prices) if len(purchase_prices) > 1 else 0,
                "min": min(purchase_prices) if purchase_prices else 0,
                "max": max(purchase_prices) if purchase_prices else 0
            },
            "rental_prices": {
                "count": len(rental_prices),
                "mean": statistics.mean(rental_prices) if rental_prices else 0,
                "median": statistics.median(rental_prices) if rental_prices else 0,
                "std_dev": statistics.stdev(rental_prices) if len(rental_prices) > 1 else 0,
                "min": min(rental_prices) if rental_prices else 0,
                "max": max(rental_prices) if rental_prices else 0
            }
        }
        
        # Price distribution by item type
        cursor.execute("""
            SELECT t.type_name, 
                   AVG(i.purchase_price) as avg_purchase,
                   AVG(i.rental_price_per_day) as avg_rental,
                   COUNT(*) as item_count
            FROM Items i
            JOIN ItemTypes t ON i.item_type_id = t.type_id
            GROUP BY t.type_name
        """)
        
        type_stats = cursor.fetchall()
        columns = [column[0] for column in cursor.description]
        stats["by_type"] = [dict(zip(columns, row)) for row in type_stats]
        
        conn.close()
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/inventory")
def get_inventory_analytics():
    """Inventory management analytics"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Inventory statistics
        cursor.execute("""
            SELECT 
                SUM(total_copies) as total_copies,
                SUM(available_copies) as available_copies,
                AVG(CAST(available_copies as FLOAT) / NULLIF(total_copies, 0)) * 100 as availability_rate
            FROM Items
            WHERE total_copies > 0
        """)
        
        inventory_stats = cursor.fetchone()
        columns = [column[0] for column in cursor.description]
        stats = dict(zip(columns, inventory_stats))
        
        # Items needing restock (less than 20% available)
        cursor.execute("""
            SELECT title, total_copies, available_copies,
                   CAST(available_copies as FLOAT) / NULLIF(total_copies, 0) * 100 as availability_percentage
            FROM Items
            WHERE total_copies > 0 
              AND CAST(available_copies as FLOAT) / NULLIF(total_copies, 0) < 0.2
        """)
        
        low_stock = cursor.fetchall()
        columns = [column[0] for column in cursor.description]
        stats["low_stock_items"] = [dict(zip(columns, row)) for row in low_stock]
        
        conn.close()
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)