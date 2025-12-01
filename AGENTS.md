# AGENTS.md - BookShop Library Development Guide

## Build/Lint/Test Commands

```bash
# Start all services
./dev.sh start                          # SQL Server + Backend + Frontend
./dev.sh stop                           # Stop all services
./dev.sh status                         # Check service status

# Testing & Validation
npx tsc --noEmit                        # Check TypeScript errors (frontend/)
cd frontend && npm test -- --watchAll=false  # Run React tests once
cd frontend && npm run build            # Build React for production
./run-admin-test.sh                     # Test database connection
curl http://localhost:8000/health       # Check backend health

# Development Commands
./dev.sh items                          # List inventory items
./dev.sh create                         # Add new item (interactive)
./dev.sh admin                          # Launch admin panel
```

## Architecture

**Three-layer stack**:
- **Frontend**: React 18 + TypeScript in `frontend/src/` — Tailwind CSS, native Fetch, AbortController patterns
- **Backend**: FastAPI (Python) in `backend/app/main.py` — REST API with auto-docs at `/docs`
- **Database**: MS SQL Server 2022 (Docker) — schema in `database/schema.sql`, connects on `localhost:1433`

**Project Structure**:
```
frontend/src/ → components/ (React.memo functional components), services/api.ts (dedup cache), types/, pages/
backend/app/main.py → GET /items (joins ItemTypes), GET /analytics/*, CORS for localhost:3000
database/schema.sql → Items, ItemTypes, Users tables with identity columns
```

## Code Style & Patterns

**React Components** (functional only, always use React.memo):
- Use `useRef` guard to prevent StrictMode double-mount: `if (didFetchRef.current) return;`
- Use `useMemo()` for derived/filtered state (never useState + effect for computed values)
- Use `AbortController` for fetch cleanup: `const controller = new AbortController(); ... return () => controller.abort();`
- Pass `signal` to all fetch calls: `fetch(url, { signal })`
- Tailwind CSS only (dark theme), no inline styles

**FastAPI Endpoints** (always join ItemTypes, return `{items: [...], count: N}`):
- Type hints: `Optional[str]` for query params
- Convert cursor to dicts: `dict(zip(columns, row))`
- Error handling: `HTTPException(status_code=500, detail=str(e))`

**API Service** (`frontend/src/services/api.ts` — dedup + cache pattern):
```typescript
let inflightGetItems: Promise<Item[]> | null = null;
let cachedItems: Item[] | null = null;
export const getItems = async (signal?: AbortSignal) => {
  if (cachedItems) return Promise.resolve(cachedItems);
  if (inflightGetItems) return inflightGetItems;
  inflightGetItems = fetch(url, { signal }).then(r => { cachedItems = r; return r; }).finally(() => { inflightGetItems = null; });
  return inflightGetItems;
};
```

**TypeScript** (interfaces in `frontend/src/types/index.ts`):
- Define `Item`, `Analytics`, `User` shapes
- Avoid `any`, use explicit types
- Descriptive names: `isLoading`, `searchTerm`, `filteredItems` (not `x`, `temp`, `d`)

**Database**: Use `pymssql.connect()`, close in `finally` block, handle errors as HTTPException

**Rules Files**: Follow `.windsurfrules` (critical patterns), `.github/copilot-instructions.md` (detailed workflows)
