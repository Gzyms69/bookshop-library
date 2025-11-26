# AI Copilot Instructions for BookShop Library

## Architecture Overview

**BookShop Library** is a full-stack hybrid bookshop/library system with three main layers:

- **Frontend**: React 18 + TypeScript in `frontend/src/` — uses Tailwind CSS, native Fetch API for data
- **Backend**: FastAPI (Python) in `backend/app/` — serves REST API with auto-documentation at `/docs`
- **Database**: MS SQL Server (Docker container) — schema in `database/schema.sql`

**Key insight**: Items can be purchased OR rented. The schema supports both `purchase_price` and `rental_price_per_day`, with inventory tracking via `total_copies` and `available_copies`.

## Critical Data Flows

1. **Frontend → API**: `CustomerPanel.tsx` calls `getItems()` → single deduped request reaches backend
2. **API → Database**: `GET /items` joins `Items` table with `ItemTypes` lookup table
3. **Response Format**: API returns `{"items": [{item_id, title, type_name, ...}], "count": N}`

## Established Patterns & Conventions

### Frontend: React + TypeScript

**Component Structure** (see `CustomerPanel.tsx` as reference):
- ✅ **Always functional components with hooks** (no class components)
- ✅ **Always wrap exports with `React.memo()`** to prevent re-renders
- ✅ **Use `useRef` guard for StrictMode double-mount prevention**
- ✅ **Use `useMemo()` for derived/filtered state** — never store computed values in `useState`
- ✅ **Use `AbortController` for unmount cleanup** to prevent memory leaks and stale updates
- ✅ **Pass `signal` from AbortController to fetch calls** for clean cancellation

**Mandatory fetch pattern**:
```tsx
const didFetchRef = useRef(false);
useEffect(() => {
  if (didFetchRef.current) return;  // Prevent StrictMode double-fetch
  didFetchRef.current = true;
  const controller = new AbortController();
  
  fetchItems(controller.signal).catch(err => {
    if (err.name === 'AbortError') return;  // Ignore unmount cancellations
    setError(err.message);
  });
  
  return () => controller.abort();  // Cleanup on unmount
}, []);
```

**Derived state pattern** (use this, NOT separate effect):
```tsx
const filteredItems = useMemo(() => {
  return items
    .filter(item => item.title.includes(searchTerm))
    .sort((a, b) => a.title.localeCompare(b.title));
}, [items, searchTerm]);  // ONLY list dependencies that affect the result
```

**Styling**: Tailwind CSS only (dark theme in existing components). No inline styles or CSS-in-JS.

### Backend: FastAPI + pymssql

**Request/Response Pattern** (see `backend/app/main.py`):
- ✅ **Always return JSON** with structure: `{"items": [...], "count": N}`
- ✅ **Always join `ItemTypes` table** to include `type_name` in item responses
- ✅ **Use type hints**: `Optional[str]` for query params: `item_type: Optional[str] = None`
- ✅ **Handle all DB errors**: `raise HTTPException(status_code=500, detail=str(e))`
- ✅ **Use CORS for localhost:3000** (already configured in `main.py`)

**Mandatory endpoint pattern**:
```python
@app.get("/items")
def get_items(item_type: Optional[str] = None):
    """Get all items, optionally filtered by type"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Always join with ItemTypes to include type_name
        query = """
            SELECT i.*, t.type_name 
            FROM Items i 
            JOIN ItemTypes t ON i.item_type_id = t.type_id
        """
        
        if item_type:
            cursor.execute(query + " WHERE t.type_name = %s", (item_type,))
        else:
            cursor.execute(query)
        
        items = cursor.fetchall()
        columns = [column[0] for column in cursor.description]
        result = [dict(zip(columns, row)) for row in items]
        
        conn.close()
        return {"items": result, "count": len(result)}  # Standard format
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**Database Connection** (see `backend/scripts/admin/db_connection.py`):
- ✅ **Use `pymssql.connect()`** with hardcoded credentials (dev only; use .env for production)
- ✅ **Always close in `finally` block** to prevent connection leaks
- ✅ **Convert cursor results to dicts**: `dict(zip(columns, row))`

### Frontend-Backend Integration

**API service layer** (`frontend/src/services/api.ts`) — MUST follow this pattern:
```typescript
let inflightGetItems: Promise<Item[]> | null = null;
let cachedItems: Item[] | null = null;

export const getItems = async (signal?: AbortSignal): Promise<Item[]> => {
  // Return cache immediately if available
  if (cachedItems) {
    debugLogger.logApiCall(url, 'GET', null, { source: 'cache' });
    return Promise.resolve(cachedItems);
  }
  
  // Reuse inflight promise to deduplicate concurrent calls
  if (inflightGetItems) {
    debugLogger.logApiCall(url, 'GET', null, { source: 'inflight' });
    return inflightGetItems;
  }
  
  // Start new fetch and cache the promise
  inflightGetItems = (async () => {
    try {
      debugLogger.logApiCall(url, 'GET', null, { source: 'network' });
      const response = await fetch(url, { signal });
      const data = await response.json();
      cachedItems = data;  // Store in cache
      return data;
    } finally {
      inflightGetItems = null;  // Clean up marker
    }
  })();
  
  return inflightGetItems;
};

export const clearItemsCache = () => { cachedItems = null; };
```

**Key benefits**:
- Only 1 network request even if `getItems()` called 5+ times simultaneously
- Subsequent calls reuse cache (instant response)
- `clearItemsCache()` forces fresh fetch when needed

**TypeScript interfaces** (`frontend/src/types/index.ts`):
- Define `Item`, `Analytics`, and other API response shapes
- Export from `services/api.ts` for use throughout components

**Important**: All fetch functions must accept `signal?: AbortSignal` parameter

## Development Workflows

### Starting & Stopping Services
```bash
./dev.sh start              # ✅ Starts SQL Server + backend + frontend
./dev.sh status             # Check if services running
./dev.sh stop               # Stop all services
./dev.sh items              # List all inventory items
./dev.sh create             # Add new item (interactive)
./dev.sh admin              # Admin panel menu
```

**Startup sequence** (happens automatically):
1. SQL Server Docker container starts (port 1433)
2. Backend venv activates → Uvicorn starts (port 8000)
3. Frontend npm start (port 3000, http://localhost:3000)

### Common Development Tasks
```bash
# Check TypeScript errors (no build output)
cd frontend && npx tsc --noEmit

# Build React for production
cd frontend && npm run build

# Test database connection
./run-admin-test.sh

# View all items in DB
./run-item-listing.sh

# Add new item to DB
./run-item-creation.sh
```

### Testing & Debugging
**API Testing**:
- Swagger UI: http://localhost:8000/docs
- Health check: `curl http://localhost:8000/health`
- Get items: `curl http://localhost:8000/items`

**Frontend Debugging**:
- React DevTools Profiler → check render counts
- Debug panel (red button bottom-right) → `debugLogger.getLogs()` in console
- `debugLogger.setLogLevel('warn')` to reduce console noise

## Project-Specific Issues & Solutions

### React StrictMode Double-Mount (Dev Only)
- **Issue**: In development, React 18 intentionally mounts components twice to catch bugs
- **Solution**: Use `useRef` guard (`didFetchRef.current`) to skip second fetch
- **Examples**: See `CustomerPanel.tsx` and `ItemCard.tsx`

### Duplicate API Calls
- **Root cause**: Multiple components fetching concurrently before deduplication was added
- **Solution**: `getItems()` maintains `inflightGetItems` promise — concurrent calls reuse it
- **Result**: Only one network request reaches backend even if called 5+ times simultaneously

### Re-render Spikes
- **Causes**: Derived state stored separately; components not memoized
- **Solution**: 
  - Use `React.memo()` on exported components (see `ItemGrid.tsx`, `ItemCard.tsx`)
  - Replace state + effect with `useMemo()` for computed values
- **Validation**: React DevTools Profiler shows render counts

### Memory Leaks from Timeouts
- **Pattern**: Components set timeouts but don't clean up on unmount
- **Solution**: Store timeout ID in `useRef` and clear in cleanup function (see `ItemCard.tsx`)

## Key Files Reference

| File | Purpose | Key Pattern |
|------|---------|------------|
| `frontend/src/services/api.ts` | API service layer | Inflight deduplication + caching |
| `frontend/src/pages/CustomerPanel.tsx` | Main page | useRef guard, useMemo filtering, AbortController |
| `frontend/src/components/ItemGrid.tsx` | Item list display | React.memo wrapping |
| `backend/app/main.py` | FastAPI app | CORS setup, /items endpoint, analytics |
| `backend/scripts/admin/db_connection.py` | DB connection utility | pymssql setup, error handling |
| `database/schema.sql` | DB schema | Items ↔ ItemTypes join, identity columns |

## Commands Quick Reference

| Command | What It Does |
|---------|------------|
| `./dev.sh start` | Start all services |
| `./dev.sh items` | List all inventory items |
| `./dev.sh create` | Add new item (interactive) |
| `./dev.sh admin` | Launch admin menu |
| `npx tsc --noEmit` | Check TypeScript errors |
| `npm run build` | Build React for production |

## When Adding Features

### Adding a New API Endpoint
1. Open `backend/app/main.py`
2. Use the pattern shown in "Backend Pattern" section above
3. **Always** join ItemTypes table if returning items
4. **Always** return JSON with "items" and "count" keys
5. Add type hints for all parameters
6. Test with: `curl http://localhost:8000/your-endpoint`

### Adding a New React Component
1. Create in `frontend/src/components/YourComponent.tsx`
2. Use functional component with TypeScript interface
3. **Wrap export with `React.memo()`**: `export const Component = React.memo(function Component({...}) { ... })`
4. If fetching data: use `useRef` guard + `AbortController` pattern
5. Use Tailwind for styling only

### Adding Database Changes
1. Update `database/schema.sql`
2. Test with: `./run-admin-test.sh`
3. Document the change in a comment
4. Run admin scripts to verify data integrity

### Adding a New Fetch Function
1. Add to `frontend/src/services/api.ts`
2. Follow the deduplication pattern if needed (in-flight promises)
3. Accept optional `signal?: AbortSignal` parameter
4. Call `debugLogger.logApiCall()` for each request
5. Export from `services/api.ts` and use in components

### When You See Duplicate State
If you notice state like:
```tsx
const [filteredItems, setFilteredItems] = useState([]);
useEffect(() => {
  const result = items.filter(...);
  setFilteredItems(result);
}, [items]);
```
**Replace with `useMemo`**:
```tsx
const filteredItems = useMemo(() => {
  return items.filter(...);
}, [items]);
```

## External Dependencies

- **Frontend**: React 18, TypeScript, Tailwind CSS, native Fetch API
- **Backend**: FastAPI, pymssql, statistics (stdlib)
- **Database**: MS SQL Server 2022 Docker image
- **Infrastructure**: Docker Desktop, WSL2 (Windows), Node.js v18+, Python 3.8+

## Production Considerations

- ⚠️ **CORS hardcoded** to `http://localhost:3000` — set via env var for production
- ⚠️ **Database credentials hardcoded** — move to `.env` file for production
- ⚠️ **Cache is session-only** — refreshes on page reload; no persistence
- ⚠️ **API docs public** at `/docs` — disable in production

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 already in use | `pkill -f node` or `./dev.sh stop` |
| SQL Server connection fails | `docker start bookshop-sql` or check Docker Desktop |
| Python import errors | `cd backend && python -m venv venv && pip install -r requirements.txt` |
| TypeScript errors | Run `npx tsc --noEmit` in `frontend/` directory |
| Duplicate API calls | Check for `didFetchRef` guard + `inflightGetItems` dedup in component |
| Multiple re-renders | Replace computed state with `useMemo()` instead of `useState` + effect |

## File Navigation Cheat Sheet

| Task | Go To |
|------|-------|
| Main UI page | `frontend/src/pages/CustomerPanel.tsx` |
| Item card display | `frontend/src/components/ItemCard.tsx` |
| Item grid layout | `frontend/src/components/ItemGrid.tsx` |
| API service/dedup | `frontend/src/services/api.ts` |
| Data types | `frontend/src/types/index.ts` |
| FastAPI routes | `backend/app/main.py` |
| DB connection | `backend/scripts/admin/db_connection.py` |
| Database schema | `database/schema.sql` |
| Admin tools | `backend/scripts/admin/` directory |
