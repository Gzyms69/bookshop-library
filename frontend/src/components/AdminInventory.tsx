import React, { useState } from 'react';
import type { Item } from '../types';
import { getAdminItems } from '../services/api';
import debugLogger from '../utils/debugLogger';

const MOCK_ITEMS: Item[] = [
  {
    item_id: 1,
    title: 'The Pragmatic Programmer',
    author_director: 'Andrew Hunt, David Thomas',
    item_type_id: 1,
    rental_price_per_day: 1.99,
    purchase_price: 39.99,
    total_copies: 5,
    available_copies: 3,
  },
  {
    item_id: 2,
    title: 'Clean Code',
    author_director: 'Robert C. Martin',
    item_type_id: 1,
    rental_price_per_day: 1.49,
    purchase_price: 34.99,
    total_copies: 4,
    available_copies: 2,
  },
];

export const AdminInventory: React.FC = () => {
  const [items, setItems] = useState<Item[]>(MOCK_ITEMS);

  const handleRefresh = async () => {
    try {
      debugLogger.log('ADMIN_INVENTORY:refresh', { source: 'stub' });
      // Safe call to stubbed helper: it will throw until backend exists.
      await getAdminItems();
    } catch (err) {
      debugLogger.log('ADMIN_INVENTORY:refresh_fallback', { error: String(err) }, 'warn');
      // Keep using local mock data for now.
      setItems(MOCK_ITEMS);
    }
  };

  const handleMockCreate = () => {
    const nextId = (items[items.length - 1]?.item_id ?? 0) + 1;
    const newItem: Item = {
      item_id: nextId,
      title: `New Mock Item #${nextId}`,
      author_director: 'Admin',
      item_type_id: 1,
      total_copies: 1,
      available_copies: 1,
      rental_price_per_day: 0.99,
    };
    debugLogger.log('ADMIN_INVENTORY:create_mock', { newItem });
    setItems((prev) => [...prev, newItem]);
  };

  const handleMockDelete = (id: number) => {
    debugLogger.log('ADMIN_INVENTORY:delete_mock', { id });
    setItems((prev) => prev.filter((i) => i.item_id !== id));
  };

  const handleMockUpdate = (id: number) => {
    debugLogger.log('ADMIN_INVENTORY:update_mock', { id });
    setItems((prev) =>
      prev.map((i) =>
        i.item_id === id ? { ...i, title: `${i.title} (edited)` } : i,
      ),
    );
  };

  return (
    <section className="bg-gray-800/70 border border-gray-700 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400 mb-1 uppercase tracking-wide">
            Inventory (Mock)
          </p>
          <h2 className="text-xl font-semibold text-gray-100">
            Items overview
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Local-only data for now. No changes are persisted to the database.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-700 text-gray-100 hover:bg-gray-600"
          >
            Refresh (stub)
          </button>
          <button
            type="button"
            onClick={handleMockCreate}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700"
          >
            Add Mock Item
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900/40">
        <table className="min-w-full text-left text-sm text-gray-200">
          <thead className="bg-gray-800/80 text-gray-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Author / Director</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2 text-right">Copies</th>
              <th className="px-4 py-2 text-right">Available</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.item_id}
                className="border-t border-gray-800 hover:bg-gray-800/60"
              >
                <td className="px-4 py-2 text-xs text-gray-400">
                  #{item.item_id}
                </td>
                <td className="px-4 py-2">
                  <span className="font-medium text-gray-100">
                    {item.title}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-300 text-xs">
                  {item.author_director || '—'}
                </td>
                <td className="px-4 py-2 text-gray-300 text-xs">
                  {item.item_type_id ?? '—'}
                </td>
                <td className="px-4 py-2 text-right text-gray-200 text-xs">
                  {item.total_copies ?? 0}
                </td>
                <td className="px-4 py-2 text-right text-gray-200 text-xs">
                  {item.available_copies ?? 0}
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleMockUpdate(item.item_id)}
                      className="px-2 py-1 rounded-md text-xs bg-gray-700 text-gray-100 hover:bg-gray-600"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMockDelete(item.item_id)}
                      className="px-2 py-1 rounded-md text-xs bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-sm text-gray-400"
                >
                  No items in mock inventory. Use &quot;Add Mock Item&quot; to
                  seed data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TODO: replace mock behavior with real getAdminItems/createItem/updateItem/deleteItem calls when backend admin endpoints are ready */}
    </section>
  );
};

export default AdminInventory;


