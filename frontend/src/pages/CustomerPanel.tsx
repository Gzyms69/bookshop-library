import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { BookIcon, FilterIcon, SearchIcon } from '../components/icons';
import { ItemGrid } from '../components/ItemGrid';
import { SearchFilters } from '../components/SearchFilters';
import { AppNavigation } from '../components/AppNavigation';
import { getItems } from '../services/api';
import type { Item } from '../types';

const CustomerPanel: React.FC = () => {
  console.log('🎬 CustomerPanel rendered');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('title');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Guard against StrictMode double-mount in development
  const didFetchRef = useRef(false);

  const fetchItems = async (signal?: AbortSignal) => {
    try {
      console.log('🔍 fetchItems called');
      setLoading(true);
      console.log('📡 About to call getItems()');
      const data = await getItems(signal);
      console.log('✅ getItems resolved with:', data);
      console.log('   Type:', typeof data, 'Is Array:', Array.isArray(data), 'Length:', Array.isArray(data) ? data.length : 'N/A');
      
      // getItems now guarantees it returns an Item[]
      const itemsArray = Array.isArray(data) ? data : [];
      console.log('📦 itemsArray prepared:', itemsArray, 'Length:', itemsArray.length);
      
      console.log('🎬 Calling setItems with:', itemsArray.length, 'items');
      setItems(itemsArray);
      console.log('✅ setItems called successfully');
      
    } catch (err: any) {
      // Ignore abort errors during unmount
      if (err.name === 'AbortError') {
        console.log('ℹ️ Fetch aborted during unmount');
        return;
      }
      console.error('❌ Error fetching items:', err);
      console.error('   Error message:', err.message);
      console.error('   Error stack:', err.stack);
      setError(err.message || 'Failed to load items');
    } finally {
      console.log('🏁 fetchItems finally block');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔔 items state changed:', items, 'Length:', items.length);
  }, [items]);

  useEffect(() => {
    // Only fetch once
    if (didFetchRef.current) {
      console.log('⏭️ Already fetched, skipping');
      return;
    }
    console.log('🎯 First mount - starting fetch');
    didFetchRef.current = true;
    
    // Don't use AbortController - StrictMode cleanup will abort in-flight requests
    // Just pass undefined signal to let request complete
    fetchItems();
    
    // Empty cleanup - don't abort
    return () => {
      console.log('🔌 Component unmounting');
    };
  }, []);

  // Compute filtered items using useMemo to avoid extra re-renders
  const filteredItems = useMemo(() => {
    const itemsArray = Array.isArray(items) ? items : [];
    let result = itemsArray;

    if (searchTerm) {
      result = result.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.author_director || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (itemTypeFilter !== 'all') {
      result = result.filter(item => item.item_type_id?.toString() === itemTypeFilter);
    }

    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case 'title': return a.title.localeCompare(b.title);
        case 'author': return (a.author_director || '').localeCompare(b.author_director || '');
        case 'price-low': return (a.rental_price_per_day || 0) - (b.rental_price_per_day || 0);
        case 'price-high': return (b.rental_price_per_day || 0) - (a.rental_price_per_day || 0);
        case 'available': return (b.available_copies || 0) - (a.available_copies || 0);
        default: return 0;
      }
    });

    return result;
  }, [items, searchTerm, sortOption, itemTypeFilter]);

  const handleTypeFilterChange = useCallback((type: string) => {
    setItemTypeFilter(type);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-dots-pattern">
        <div className="w-full max-w-screen-2xl mx-auto flex items-center justify-center flex-grow">
          <div className="text-center flex flex-col items-center">
            <div role="status" className="mb-6">
              <svg aria-hidden="true" className="w-16 h-16 text-gray-600 animate-spin fill-green-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5424 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-300">Loading Library...</h2>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-dots-pattern">
        <div className="w-full max-w-screen-2xl mx-auto flex items-center justify-center flex-grow">
          <div className="text-center bg-red-900/20 border border-red-500 text-red-300 px-4 py-5 rounded-lg max-w-2xl">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <div className="mt-4">
              <button
                onClick={() => fetchItems()}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const itemsArray = Array.isArray(items) ? items : [];
  const filteredArray = Array.isArray(filteredItems) ? filteredItems : [];

  return (
    <main className="min-h-screen w-full flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-dots-pattern">
      <div className="w-full max-w-screen-2xl mx-auto flex flex-col flex-grow">
        <AppNavigation />
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 pb-2">
            BookShop Library
          </h1>
          <p className="mt-3 text-base text-gray-400 max-w-3xl mx-auto">
            Discover our collection of books, movies, games, and magazines.
          </p>
        </header>

        {itemsArray.length === 0 ? (
          <div className="text-center flex flex-col items-center">
            <div className="bg-gray-800 p-6 rounded-full mb-6 border border-gray-700">
              <BookIcon className="w-12 h-12 text-green-400" />
            </div>
            <p className="text-lg text-gray-400">No items available in the library.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-100">
                  Our Collection
                  <span className="text-green-400 ml-2">({filteredArray.length})</span>
                </h2>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="title">Sort by Title</option>
                  <option value="author">Sort by Author</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <FilterIcon className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>
            
            {showFilters && (
              <SearchFilters
                itemTypeFilter={itemTypeFilter}
                onTypeFilterChange={handleTypeFilterChange}
                onClose={() => setShowFilters(false)}
              />
            )}

            <ItemGrid items={filteredArray} />
            
            {filteredArray.length === 0 && itemsArray.length > 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
                  <BookIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No items found</h3>
                  <p className="text-gray-400">
                    {searchTerm 
                      ? `No items match your search for "${searchTerm}".`
                      : 'No items match your current filters.'
                    }
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <footer className="text-center mt-10 text-sm text-gray-500">
        <p>BookShop Library Management System</p>
      </footer>
    </main>
  );
};

export default CustomerPanel;