import debugLogger from '../utils/debugLogger';
import {
  Item,
  AdminItemCreatePayload,
  AdminItemUpdatePayload,
} from '../types';

export interface Analytics {
  purchase_prices: {
    mean: number;
    median: number;
    min: number;
    max: number;
  };
  rental_prices: {
    mean: number;
    median: number;
    min: number;
    max: number;
  };
  total_items: number;
  available_items: number;
}

const API_BASE = 'http://localhost:8000';

// In-flight promise for deduplication and optional caching
let inflightGetItems: Promise<Item[]> | null = null;
let cachedItems: Item[] | null = null;

/**
 * Clear the items cache. Call this when you want to force a fresh fetch.
 */
export const clearItemsCache = () => {
  cachedItems = null;
};

/**
 * Fetch items with built-in deduplication and optional caching.
 * Concurrent calls will reuse the same in-flight request.
 * @param signal - Optional AbortSignal to cancel the request
 * @returns Promise<Item[]>
 */
export const getItems = async (signal?: AbortSignal): Promise<Item[]> => {
  console.log('📞 getItems() called');
  
  // Return cached items immediately if present
  if (cachedItems) {
    console.log('💾 Returning cached items');
    debugLogger.logApiCall(`${API_BASE}/items`, 'GET', null, { source: 'cache' });
    return Promise.resolve(cachedItems);
  }

  // If there's an inflight request, reuse it
  if (inflightGetItems) {
    console.log('🔄 Reusing inflight request');
    debugLogger.logApiCall(`${API_BASE}/items`, 'GET', null, { source: 'inflight' });
    return inflightGetItems;
  }

  console.log('🚀 Starting new fetch to ' + API_BASE + '/items');
  
  // Otherwise, start a new fetch and save the inflight promise
  inflightGetItems = (async () => {
    try {
      console.log('⏳ Fetching...');
      const response = await fetch(`${API_BASE}/items`, { signal });
      console.log('📨 Fetch completed, status:', response.status, 'ok:', response.ok);
      
      if (!response.ok) {
        throw new Error('Failed to fetch items, status: ' + response.status);
      }
      
      console.log('📖 Parsing JSON...');
      const data = await response.json();
      console.log('✅ JSON parsed, Raw API response:', data);
      
      // Backend returns { items: [...], count: N }, extract items array
      const itemsArray = Array.isArray(data) ? data : (data.items || []);
      console.log('📦 Extracted items array:', itemsArray, 'Length:', itemsArray.length);
      
      // Log AFTER we have the actual data
      debugLogger.logApiCall(`${API_BASE}/items`, 'GET', null, { 
        source: 'network', 
        itemsCount: itemsArray.length,
        response: itemsArray 
      });
      
      cachedItems = itemsArray;
      console.log('💾 Cached items, returning:', itemsArray.length, 'items');
      return itemsArray;
    } catch (err) {
      console.error('❌ Error in getItems promise:', err);
      debugLogger.log('API_ERROR', { url: API_BASE + '/items', error: String(err) }, 'error');
      throw err;
    } finally {
      // Clean up the inflight marker once resolved/rejected
      console.log('🧹 Cleaning up inflight marker');
      inflightGetItems = null;
    }
  })();

  console.log('↩️ Returning inflight promise');
  return inflightGetItems;
};

export const getPricingAnalytics = async (): Promise<Analytics> => {
  const response = await fetch(`${API_BASE}/analytics/pricing`);
  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }
  return response.json();
};

/**
 * Admin API stubs
 * These are intentionally unimplemented and will be wired to real backend endpoints later.
 */
export const getAdminItems = async (_signal?: AbortSignal): Promise<Item[]> => {
  throw new Error('Admin API getAdminItems not implemented yet');
};

export const createItem = async (_payload: AdminItemCreatePayload): Promise<Item> => {
  throw new Error('Admin API createItem not implemented yet');
};

export const updateItem = async (
  _id: number,
  _payload: AdminItemUpdatePayload,
): Promise<Item> => {
  throw new Error('Admin API updateItem not implemented yet');
};

export const deleteItem = async (_id: number): Promise<void> => {
  throw new Error('Admin API deleteItem not implemented yet');
};

export const getInventoryAnalytics = async (): Promise<any> => {
  const response = await fetch(`${API_BASE}/analytics/inventory`);
  if (!response.ok) {
    throw new Error('Failed to fetch inventory analytics');
  }
  return response.json();
};