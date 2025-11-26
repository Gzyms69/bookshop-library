import React, { useState } from 'react';
import type { AdminItemCreatePayload } from '../types';
import debugLogger from '../utils/debugLogger';

interface ItemFormProps {
  onSubmit: (item: AdminItemCreatePayload) => void;
  onCancel: () => void;
}

const ITEM_TYPES = [
  { id: 1, name: 'Book' },
  { id: 2, name: 'Movie' },
  { id: 3, name: 'Magazine' },
];

export const ItemForm: React.FC<ItemFormProps> = React.memo(function ItemForm({
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState<AdminItemCreatePayload>({
    title: '',
    author_director: '',
    item_type_id: 1,
    purchase_price: undefined,
    rental_price_per_day: undefined,
    total_copies: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'item_type_id' || name === 'total_copies'
          ? parseInt(value, 10)
          : name === 'purchase_price' || name === 'rental_price_per_day'
            ? value
              ? parseFloat(value)
              : undefined
            : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.author_director?.trim()) {
      newErrors.author_director = 'Author/Director is required';
    }
    if (!formData.item_type_id) {
      newErrors.item_type_id = 'Item type is required';
    }
    if (
      formData.total_copies === undefined ||
      formData.total_copies < 1
    ) {
      newErrors.total_copies = 'Total copies must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      debugLogger.log('ITEM_FORM:submit', { formData });
      onSubmit(formData);
      setFormData({
        title: '',
        author_director: '',
        item_type_id: 1,
        purchase_price: undefined,
        rental_price_per_day: undefined,
        total_copies: 1,
      });
    }
  };

  return (
    <div className="bg-gray-800/70 border border-gray-700 rounded-2xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">
        Create New Item
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., The Pragmatic Programmer"
            className={`w-full px-4 py-2 rounded-lg bg-gray-900 text-gray-100 border ${
              errors.title ? 'border-red-500' : 'border-gray-700'
            } focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
          />
          {errors.title && (
            <p className="text-red-400 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        {/* Author / Director */}
        <div>
          <label htmlFor="author_director" className="block text-sm font-medium text-gray-300 mb-2">
            Author / Director <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="author_director"
            name="author_director"
            value={formData.author_director || ''}
            onChange={handleChange}
            placeholder="e.g., Andrew Hunt, David Thomas"
            className={`w-full px-4 py-2 rounded-lg bg-gray-900 text-gray-100 border ${
              errors.author_director ? 'border-red-500' : 'border-gray-700'
            } focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
          />
          {errors.author_director && (
            <p className="text-red-400 text-xs mt-1">{errors.author_director}</p>
          )}
        </div>

        {/* Item Type */}
        <div>
          <label htmlFor="item_type_id" className="block text-sm font-medium text-gray-300 mb-2">
            Item Type <span className="text-red-400">*</span>
          </label>
          <select
            id="item_type_id"
            name="item_type_id"
            value={formData.item_type_id || ''}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg bg-gray-900 text-gray-100 border ${
              errors.item_type_id ? 'border-red-500' : 'border-gray-700'
            } focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
          >
            {ITEM_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {errors.item_type_id && (
            <p className="text-red-400 text-xs mt-1">{errors.item_type_id}</p>
          )}
        </div>

        {/* Total Copies */}
        <div>
          <label htmlFor="total_copies" className="block text-sm font-medium text-gray-300 mb-2">
            Total Copies <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            id="total_copies"
            name="total_copies"
            value={formData.total_copies || ''}
            onChange={handleChange}
            min="1"
            placeholder="e.g., 5"
            className={`w-full px-4 py-2 rounded-lg bg-gray-900 text-gray-100 border ${
              errors.total_copies ? 'border-red-500' : 'border-gray-700'
            } focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
          />
          {errors.total_copies && (
            <p className="text-red-400 text-xs mt-1">{errors.total_copies}</p>
          )}
        </div>

        {/* Purchase Price */}
        <div>
          <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-300 mb-2">
            Purchase Price (Optional)
          </label>
          <input
            type="number"
            id="purchase_price"
            name="purchase_price"
            value={formData.purchase_price || ''}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="e.g., 39.99"
            className="w-full px-4 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Rental Price Per Day */}
        <div>
          <label htmlFor="rental_price_per_day" className="block text-sm font-medium text-gray-300 mb-2">
            Rental Price Per Day (Optional)
          </label>
          <input
            type="number"
            id="rental_price_per_day"
            name="rental_price_per_day"
            value={formData.rental_price_per_day || ''}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="e.g., 1.99"
            className="w-full px-4 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Create Item
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 text-gray-100 hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
});

export default ItemForm;
