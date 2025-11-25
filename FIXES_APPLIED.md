# Performance & Stability Fixes Applied

## Overview
Applied comprehensive fixes to eliminate duplicate API calls, reduce unnecessary re-renders, improve debug logging, and capture "message channel closed" errors.

---

## Changes Summary

### 1. **`src/services/api.ts`** — In-flight Deduplication & Caching

**What was changed:**
- Added import for `debugLogger`
- Introduced `inflightGetItems` promise for concurrent request deduplication
- Introduced `cachedItems` variable for optional caching
- Modified `getItems()` signature to accept optional `AbortSignal`
- Implemented logic to return cached items, reuse inflight promises, or start new fetch
- Added `clearItemsCache()` export for manual cache invalidation
- Each network call is logged with source: `'cache'`, `'inflight'`, or `'network'`

**Why it works:**
- Concurrent calls to `getItems()` reuse the same in-flight promise instead of creating duplicate requests
- Cached items are returned instantly without a new fetch
- `AbortSignal` support allows cancellation on component unmount

**Expected behavior:**
- Only one GET request to `/items` appears in DevTools network tab (not two, even on mount with StrictMode)
- Subsequent calls within the same session reuse the inflight promise

---

### 2. **`src/pages/CustomerPanel.tsx`** — StrictMode Guard, useMemo, and Abort Support

**What was changed:**
- Added imports: `useRef`, `useMemo`, and `getItems` from API service
- Removed `filteredItems` state variable
- Added `didFetchRef` to guard against duplicate fetches in development StrictMode
- Modified initial `useEffect` to check `didFetchRef` and use `AbortController`:
  ```tsx
  const didFetchRef = useRef(false);
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    const controller = new AbortController();
    fetchItems(controller.signal);
    return () => controller.abort();
  }, []);
  ```
- Updated `fetchItems()` to accept optional `signal` parameter and use `getItems(signal)`
- Replaced the separate `useEffect` for filtering with **`useMemo`** to compute `filteredItems`:
  - `filteredItems` is now derived/computed, not stored as state
  - Eliminates extra re-render when applying filters/sort
- Removed verbose debug logging (`console.log` calls)
- Updated "Try Again" error button to use arrow function: `onClick={() => fetchItems()}`

**Why it works:**
- `didFetchRef` prevents React 18 StrictMode from double-mounting and calling `fetchItems` twice in development
- `AbortController` cancels in-flight requests when component unmounts (prevents memory leaks and stale state updates)
- `useMemo` eliminates the extra render caused by storing filtered results in state; computed on-demand instead
- Centralized `getItems()` handles deduplication, so even if `CustomerPanel` mounted twice, only one API call occurs

**Expected behavior:**
- Single API call on mount (even under StrictMode)
- Filtered results update without extra render passes
- No console errors about state updates after unmount
- Fewer renders visible in React DevTools Profiler

---

### 3. **`src/components/ItemGrid.tsx`** — React.memo Wrapping

**What was changed:**
- Wrapped component export with `React.memo`:
  ```tsx
  export const ItemGrid: React.FC<ItemGridProps> = React.memo(function ItemGrid({ items }) {
    // ... component body
  });
  ```

**Why it works:**
- `React.memo` prevents re-renders of `ItemGrid` if `items` prop hasn't changed
- Since `items` are now memoized in `CustomerPanel`, the grid won't re-render unnecessarily
- Reduces cascading re-renders down the component tree

**Expected behavior:**
- `ItemGrid` only re-renders when item data actually changes
- Less CPU usage and faster DOM updates

---

### 4. **`src/components/ItemCard.tsx`** — React.memo, Guarded Logging & Timeout Cleanup

**What was changed:**
- Wrapped component export with `React.memo`:
  ```tsx
  export const ItemCard: React.FC<ItemCardProps> = React.memo(function ItemCard({ item }) {
    // ...
  });
  ```
- Added `prevItemIdRef` and `styleTimeoutRef` refs for tracking
- Modified `useEffect` to only log when `item.item_id` changes (not on every render):
  ```tsx
  if (prevItemIdRef.current !== item.item_id) {
    debugLogger.logComponent('ItemCard', {...});
    prevItemIdRef.current = item.item_id;
  }
  ```
- Stored setTimeout result and added cleanup:
  ```tsx
  styleTimeoutRef.current = window.setTimeout(checkStyles, 50);
  return () => {
    if (styleTimeoutRef.current) {
      clearTimeout(styleTimeoutRef.current);
    }
  };
  ```

**Why it works:**
- `React.memo` prevents re-renders if `item` prop hasn't changed
- Guarded logging prevents logging spam (console logs on every render cause re-renders)
- Timeout cleanup prevents memory leaks and stale DOM access

**Expected behavior:**
- Each `ItemCard` only logs once when item ID first appears (not on every render)
- Cleaner console output with fewer debug messages
- Less noisy DevTools console
- Proper memory cleanup on unmount

---

### 5. **`src/utils/debugLogger.ts`** — Log-Level Gating

**What was changed:**
- Added `logLevel` private variable: `'info' | 'warn' | 'error' | 'none'`
- Added `setLogLevel()` method to control log verbosity
- Modified `log()` to filter by level:
  ```tsx
  if (this.logLevel === 'none') return;
  if (this.logLevel === 'warn' && level === 'info') return;
  if (this.logLevel === 'error' && level !== 'error') return;
  ```

**Why it works:**
- Allows throttling of info-level logs without disabling error tracking
- In production or for cleaner console, call `debugLogger.setLogLevel('error')` to only show errors
- Default is `'info'` so all logs show during development

**Expected behavior:**
- All logs visible by default
- Can reduce noise by calling `debugLogger.setLogLevel('warn')` in browser console
- Error logs always appear for debugging

---

### 6. **`src/utils/initDebug.ts`** — Enhanced Error Tracking

**What was changed:**
- Updated `unhandledrejection` event listener to capture stack info:
  ```tsx
  debugLogger.log('UNHANDLED_REJECTION', {
    reason: event.reason,
    stack: event.reason?.stack,
    message: event.reason?.message
  }, 'error');
  ```

**Why it works:**
- Captures the full stack trace and message for unhandled promise rejections
- Helps identify origin of errors like "message channel closed"
- Stored in debug logs for export and analysis

**Expected behavior:**
- Better error diagnostics in the debug panel
- Stack traces visible when exporting logs

---

## How to Validate the Fixes

### Test 1: Verify Single API Call on Load
1. Start the dev environment: `bash dev.sh start` (from WSL in project root)
2. Open http://localhost:3000 in browser
3. Open DevTools → Network tab → Filter to XHR/Fetch requests
4. **Expected:** Only ONE request to `GET http://localhost:8000/items` appears (not two)
5. Items display correctly in the UI

### Test 2: Verify Cache/Inflight Dedupe
1. Open browser console and run:
   ```javascript
   debugLogger.setLogLevel('info')
   ```
2. Open Network tab and clear requests
3. Reload the page
4. **Expected:** Console shows `API_CALL` log with `source: 'network'` on first call
5. Reload again: Console shows `source: 'cache'` instead of a new network request

### Test 3: Check React Re-renders
1. Install [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/) extension
2. Open http://localhost:3000
3. Open React DevTools → Profiler tab → Record
4. Perform an action (e.g., change search term, sort items)
5. Stop recording
6. **Expected:** 
   - `CustomerPanel` renders 1–2 times (not 3–5)
   - `ItemGrid` renders only when items change
   - Each `ItemCard` renders only once per item ID

### Test 4: Verify Abort on Unmount
1. Open browser DevTools → Network tab
2. Start a slow 3G throttle (DevTools → Throttling)
3. Reload page and quickly close the browser tab before items load
4. **Expected:** Request is aborted (shows "cancelled" in network tab)
5. No console errors about "state updates after unmount"

### Test 5: Monitor Debug Logs
1. Open the Debug Panel (red button in bottom-right)
2. Perform actions (load items, search, filter)
3. **Expected:**
   - Console is cleaner (fewer ItemCard logs)
   - Logs are organized by category
   - API calls show source: 'network', 'cache', or 'inflight'
   - No repeated logs per render

### Test 6: Check for "Message Channel Closed" Error
1. Open DevTools Console
2. Look for errors like "message channel closed"
3. **If still present:**
   - Note the stack trace in the console
   - Run in incognito with extensions disabled to isolate
   - Check `debugLogger.getLogs()` in console for error origin
   - If stack points to devtools/extension, it's not an app issue

### Test 7: Build for Production
1. Run from WSL in project root:
   ```bash
   cd frontend
   npm run build
   ```
2. Serve the build:
   ```bash
   npx serve -s build
   ```
3. Visit http://localhost:3000 (from serve)
4. **Expected:** App loads correctly, no errors, clean console

---

## Summary of Improvements

| Issue | Before | After | Verification |
|-------|--------|-------|--------------|
| **Duplicate API Calls** | 2 requests on mount (StrictMode) | 1 request | Network tab shows single GET |
| **Multiple Re-renders** | `ItemCard` renders 5+ times | Renders 1–2 times per item | React DevTools Profiler |
| **Filtered State Re-renders** | Extra render per filter change | Computed via useMemo | Profiler shows fewer renders |
| **Debug Log Spam** | Logs on every render (noisy) | Logs only when item ID changes | Console is cleaner |
| **Timeout Cleanup** | Timeouts not cleared on unmount | Properly cleaned up | No memory leaks |
| **Error Tracking** | Limited error info | Full stack traces captured | Debug panel shows stacks |
| **Message Channel Error** | Logged but no context | Stack info in unhandledrejection | Better diagnosis in logs |

---

## Files Modified

1. `frontend/src/services/api.ts` — Inflight dedupe & caching
2. `frontend/src/pages/CustomerPanel.tsx` — StrictMode guard, useMemo, AbortController
3. `frontend/src/components/ItemGrid.tsx` — React.memo wrapping
4. `frontend/src/components/ItemCard.tsx` — React.memo, guarded logging, timeout cleanup
5. `frontend/src/utils/debugLogger.ts` — Log-level gating
6. `frontend/src/utils/initDebug.ts` — Enhanced error tracking

---

## Next Steps (Optional Enhancements)

1. **React Query/TanStack Query** — For production-grade caching and request deduplication
2. **Error Boundary** — Add error boundary to catch render errors gracefully
3. **Performance Monitoring** — Add Sentry or similar for production error tracking
4. **Stale-While-Revalidate** — Implement cache invalidation strategy (e.g., refetch after 5 minutes)

---

## Notes

- All changes maintain backward compatibility
- No breaking changes to component APIs
- Debug logging is still fully functional, just more controlled
- Cache persists for the session; clear with `clearItemsCache()` if needed
- `AbortController` ensures clean unmounts
