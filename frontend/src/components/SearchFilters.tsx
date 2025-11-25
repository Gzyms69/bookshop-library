import React from 'react';
import { FilterIcon } from './icons';

interface SearchFiltersProps {
  itemTypeFilter: string;
  onTypeFilterChange: (type: string) => void;
  onClose: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  itemTypeFilter,
  onTypeFilterChange,
  onClose,
}) => {
  const itemTypes = [
    { id: 'all', name: 'All Items', color: 'bg-gray-500' },
    { id: '1', name: 'Books', color: 'bg-blue-500' },
    { id: '2', name: 'Magazines', color: 'bg-green-500' },
    { id: '3', name: 'Movies', color: 'bg-purple-500' },
    { id: '4', name: 'Board Games', color: 'bg-orange-500' },
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FilterIcon className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-gray-100">Filters</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200 transition-colors"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Item Type</h4>
          <div className="flex flex-wrap gap-2">
            {itemTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onTypeFilterChange(type.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 ${
                  itemTypeFilter === type.id
                    ? 'bg-gray-700 border-green-500 text-gray-100'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${type.color}`}></span>
                {type.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);