import debugLogger from '../utils/debugLogger';

export interface Item {
  item_id: number;
  title: string;
  author_director?: string;
  item_type_id?: number;
  purchase_price?: number;
  rental_price_per_day?: number;
  total_copies?: number;
  available_copies?: number;
  created_date?: string;
  last_updated?: string;
  type_name?: string; // If your backend provides this
}

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
  // Return cached items immediately if present
  if (cachedItems) {
    debugLogger.logApiCall(`${API_BASE}/items`, 'GET', null, { source: 'cache' });
    return Promise.resolve(cachedItems);
  }

  // If there's an inflight request, reuse it
  if (inflightGetItems) {
    debugLogger.logApiCall(`${API_BASE}/items`, 'GET', null, { source: 'inflight' });
    return inflightGetItems;
  }

  // Otherwise, start a new fetch and save the inflight promise
  inflightGetItems = (async () => {
    try {
      debugLogger.logApiCall(`${API_BASE}/items`, 'GET', null, { source: 'network' });
      const response = await fetch(`${API_BASE}/items`, { signal });
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();
      cachedItems = data;
      return data;
    } finally {
      // Clean up the inflight marker once resolved/rejected
      inflightGetItems = null;
    }
  })();

  return inflightGetItems;
};

export const getPricingAnalytics = async (): Promise<Analytics> => {
  const response = await fetch(`${API_BASE}/analytics/pricing`);
  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }
  return response.json();
};

export const getInventoryAnalytics = async (): Promise<any> => {
  const response = await fetch(`${API_BASE}/analytics/inventory`);
  if (!response.ok) {
    throw new Error('Failed to fetch inventory analytics');
  }
  return response.json();
};