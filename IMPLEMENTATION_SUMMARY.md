# Implementation Summary: Fix Duplicate API Calls, Reduce Re-renders

## Changes Made

### 1. `src/services/api.ts` - Added In-flight Deduplication & Caching
**Purpose:** Prevent duplicate network requests when components fetch concurrently or when React StrictMode causes double mounts.

**Changes:**
- Added module-level variables:
  - `inflightGetItems: Promise<Item[]> | null` - stores an in-flight request so concurrent calls reuse it
  - `cachedItems: Item[] | null` - optional in-memory cache for items
  
- Updated `getItems()` function to:
  - Accept optional `signal?: AbortSignal` parameter for cancellation support
  - Return cached items immediately if available
  - Reuse an in-flight request if one exists
  - Otherwise start a new fetch and clean up the inflight marker when complete
  
- Added `clearItemsCache()` export for manual cache invalidation

- Enhanced with `debugLogger.logApiCall()` to track: 'network', 'cache', or 'inflight' request sources

**Result:** Only one actual network request occurs even if multiple components call `getItems()` simultaneously.

---

### 2. `src/pages/CustomerPanel.tsx` - Fixed React StrictMode Double-Mount & Removed Derived State

**Purpose:** Eliminate duplicate fetches in development and reduce unnecessary re-renders.

**Changes:**
- Removed `filteredItems` state variable entirely
- Added `didFetchRef: useRef(false)` to guard against StrictMode double-mount
- Updated initial `useEffect` to:
  - Check if fetch already ran (via ref)
  - Create `AbortController` to cancel fetch on unmount
  - Return cleanup function that aborts pending request
  
- Updated `fetchItems()` function to:
  - Accept optional `signal?: AbortSignal`
  - Use `getItems(signal)` instead of raw fetch
  - Ignore AbortError during unmount
  - Simplify data handling (getItems now guarantees Item[])
  
- Replaced `filteredItems` state update + effect with `useMemo` computation:
  ```tsx
  const filteredItems = useMemo(() => {
    // filter and sort logic
    return result;
  }, [items, searchTerm, sortOption, itemTypeFilter]);
  ```

**Result:** 
- Single fetch call even with React StrictMode double-mount in development
- Fetch is properly canceled on component unmount (prevents stale state updates)
- No extra re-renders from derived state updates

---

### 3. `src/components/ItemGrid.tsx` - Added React.memo

**Purpose:** Prevent unnecessary re-renders when parent updates but items prop hasn't changed.

**Changes:**
- Wrapped component export with `React.memo()`
  ```tsx
  export const ItemGrid: React.FC<ItemGridProps> = React.memo(function ItemGrid({ items }) { ... });
  ```

**Result:** ItemGrid only re-renders when `items` reference actually changes.

---

### 4. `src/components/ItemCard.tsx` - Added React.memo, Guarded Logging, and Timeout Cleanup

**Purpose:** Reduce per-card re-renders, minimize debug logging noise, and ensure proper cleanup.

**Changes:**
- Wrapped component with `React.memo()`
- Added refs for tracking:
  - `prevItemIdRef` - prevents logging on every render
  - `styleTimeoutRef` - tracks setTimeout for proper cleanup
  
- Updated `useEffect` to:
  - Only log component render when `item.item_id` changes (not on every render)
  - Store setTimeout ID in ref and clear in cleanup function
  
- Guarded debug logging:
  ```tsx
  if (prevItemIdRef.current !== item.item_id) {
    debugLogger.logComponent(...);
    prevItemIdRef.current = item.item_id;
  }
  ```

**Result:** 
- ItemCard only re-renders when item props actually change
- Debug logs reduced from 1+ per render to 1 per unique item
- Proper timeout cleanup prevents memory leaks

---

### 5. `src/utils/debugLogger.ts` - Added Log Level Gating

**Purpose:** Reduce console noise and allow control over what gets logged.

**Changes:**
- Added `logLevel` property: `'info' | 'warn' | 'error' | 'none'`
- Added `setLogLevel(level)` method
- Updated `log()` method to filter based on level:
  - 'none': nothing logged
  - 'error': only errors
  - 'warn': errors and warnings
  - 'info': all logs (default)

**Usage Example:**
```ts
debugLogger.setLogLevel('warn'); // Only show warnings and errors
debugLogger.setLogLevel('error'); // Only show actual errors
debugLogger.setLogLevel('info');  // Show all logs (default)
```

**Result:** Console output is less noisy during development.

---

### 6. `src/utils/initDebug.ts` - Enhanced Error Capture

**Purpose:** Better tracking of the "message channel closed" error origin.

**Changes:**
- Updated `unhandledrejection` event handler to capture:
  - `reason`: the error
  - `stack`: the error's stack trace
  - `message`: error message

**Result:** Stack traces are logged, making it easier to identify where errors originate.

---

## Validation Checklist

### Test 1: Verify Single Network Call
- [ ] Open DevTools Network tab
- [ ] Reload the page
- [ ] Confirm only **one** GET request to `http://localhost:8000/items`
- [ ] Even though React mounts the component twice in StrictMode (expected in dev), only one network request should occur

### Test 2: Verify No Extra Re-renders
- [ ] Open React DevTools Profiler
- [ ] Record a profile while the page loads
- [ ] Check ItemCard and ItemGrid render counts
- [ ] ItemCard should render once per item (not multiple times per render cycle)
- [ ] ItemGrid should render once when items change

### Test 3: Verify Fetch Cancellation on Unmount
- [ ] Add a console log in the fetch handler
- [ ] Navigate away from the page while a slow network request is pending
- [ ] Confirm no state updates occur after unmount (no errors in console)

### Test 4: Verify Debug Logging Reduction
- [ ] Open browser console
- [ ] Check that "COMPONENT:ItemCard" logs only appear once per unique item_id
- [ ] Not on every render
- [ ] Set `debugLogger.setLogLevel('warn')` in console to suppress info logs

### Test 5: Verify Cache and Deduplication
- [ ] Call `debugLogger.getLogs()` in the browser console
- [ ] Search for 'API_CALL' entries
- [ ] Confirm you see entries with `source: 'network'` only once
- [ ] Subsequent calls should show `source: 'cache'` or `source: 'inflight'`

### Test 6: Test the "Message Channel Closed" Error
- [ ] Open in incognito window with extensions disabled
- [ ] If error disappears: it's from a browser extension or devtools
- [ ] If error persists: check console stack trace for origin
- [ ] Check `debugLogger.getLogs()` for UNHANDLED_REJECTION entries with stack info

---

## Quick Commands to Test

```powershell
# Navigate to frontend directory
cd "c:\Users\PC\bookshop-library\frontend"

# Verify TypeScript compilation
npx tsc --noEmit

# Start development server
npm start

# In browser console, test:
debugLogger.setLogLevel('warn')           # Reduce noise
debugLogger.getLogs()                     # View all logs
debugLogger.exportLogs()                  # Download logs to file
```

---

## Expected Improvements

| Issue | Before | After |
|-------|--------|-------|
| **Duplicate API Calls** | 2+ requests per load | 1 request per load |
| **ItemCard Re-renders** | Multiple per update | Once per item change |
| **Debug Log Spam** | ~1+ logs per card render | 1 log per unique item_id |
| **Unmount Cleanup** | Potential stale state | Proper abort + cleanup |
| **Memory Usage** | Unbounded | Small in-memory cache |

---

## How to Use Inflight Dedupe + Cache

```typescript
// In any component:
import { getItems, clearItemsCache } from '../services/api';

// First call starts a network request
const items1 = await getItems();  // Makes network call, caches result

// Concurrent call reuses the in-flight promise
const items2 = await getItems();  // Reuses the same promise

// Subsequent calls return cached result
const items3 = await getItems();  // Returns cached data immediately

// Force a fresh fetch (clear cache)
clearItemsCache();
const items4 = await getItems();  // New network call
```

---

## Notes on React StrictMode

In development, React 18+ StrictMode intentionally double-mounts components to catch side effects:
- Before fix: This caused 2 API calls
- After fix: The `didFetchRef` guard prevents duplicate fetches

This is expected and good for development — it helps catch bugs. The fix ensures we handle it correctly.

---

## Next Steps (Optional)

1. **React Query / TanStack Query** - For more advanced caching, invalidation, and background sync
2. **Service Worker Caching** - For offline support and persistent cache
3. **Response Caching Headers** - Coordinate with backend on cache-control headers
4. **Monitoring** - Track API call metrics in analytics or error tracking service

---

## Files Modified

1. ✅ `src/services/api.ts` - Added deduplication & caching
2. ✅ `src/pages/CustomerPanel.tsx` - Fixed double-mount & removed derived state
3. ✅ `src/components/ItemGrid.tsx` - Added React.memo
4. ✅ `src/components/ItemCard.tsx` - Added React.memo, guarded logging, cleanup
5. ✅ `src/utils/debugLogger.ts` - Added log-level gating
6. ✅ `src/utils/initDebug.ts` - Enhanced error capture

All changes are backward compatible and don't affect component APIs.
