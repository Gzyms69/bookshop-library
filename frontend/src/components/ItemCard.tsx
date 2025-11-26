import React, { useEffect, useRef } from 'react';
import { BookIcon, MovieIcon, GameIcon, MagazineIcon } from './icons';
import { Item } from '../types';
import debugLogger from '../utils/debugLogger';

interface ItemCardProps {
  item: Item;
}

export const ItemCard: React.FC<ItemCardProps> = React.memo(function ItemCard({ item }) {
  const typeBadgeRef = useRef<HTMLDivElement>(null);
  const prevItemIdRef = useRef<number | null>(null);
  const styleTimeoutRef = useRef<number | null>(null);

  const getItemIcon = (typeId: number | undefined) => {
    switch (typeId) {
      case 1: return <BookIcon className="w-5 h-5" />;
      case 2: return <MagazineIcon className="w-5 h-5" />;
      case 3: return <MovieIcon className="w-5 h-5" />;
      case 4: return <GameIcon className="w-5 h-5" />;
      default: return <BookIcon className="w-5 h-5" />;
    }
  };

  const getItemTypeName = (typeId: number | undefined) => {
    switch (typeId) {
      case 1: return 'Book';
      case 2: return 'Magazine';
      case 3: return 'Movie';
      case 4: return 'Board Game';
      default: return 'Item';
    }
  };

  const getTypeColor = (typeId: number | undefined) => {
    const colorMap = {
      1: 'text-cyan-500 bg-cyan-500/20 border-cyan-500/30',
      2: 'text-lime-500 bg-lime-500/20 border-lime-500/30',
      3: 'text-fuchsia-500 bg-fuchsia-500/20 border-fuchsia-500/30',
      4: 'text-amber-500 bg-amber-500/20 border-amber-500/30',
      default: 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    };

    const result = typeId ? colorMap[typeId as keyof typeof colorMap] || colorMap.default : colorMap.default;
    
    debugLogger.log('STYLES:ItemCard_Generation', {
      typeId,
      typeName: getItemTypeName(typeId),
      generatedClasses: result,
      itemId: item.item_id
    });
    
    return result;
  };

  useEffect(() => {
    // Only log when the item ID changes (not on every render)
    if (prevItemIdRef.current !== item.item_id) {
      debugLogger.logComponent('ItemCard', {
        itemId: item.item_id,
        itemTypeId: item.item_type_id,
        title: item.title,
        typeName: getItemTypeName(item.item_type_id)
      });
      prevItemIdRef.current = item.item_id;
    }

    // Check applied styles after render
    const checkStyles = () => {
      if (typeBadgeRef.current) {
        const element = typeBadgeRef.current;
        const computedStyle = window.getComputedStyle(element);
        const expectedClasses = getTypeColor(item.item_type_id);
        
        debugLogger.logStyles('ItemCard', {
          element: {
            tagName: element.tagName,
            actualClasses: element.className,
            itemId: item.item_id,
            itemTypeId: item.item_type_id
          },
          computedStyles: {
            color: computedStyle.color,
            backgroundColor: computedStyle.backgroundColor,
            borderColor: computedStyle.borderColor,
            opacity: computedStyle.opacity
          },
          expectedClasses,
          matches: element.className.includes(expectedClasses.split(' ')[0]) // Check if first class is present
        }, expectedClasses, element.className);
      }
    };

    // Check styles after a short delay to ensure DOM is updated
    styleTimeoutRef.current = window.setTimeout(checkStyles, 50);
    return () => {
      if (styleTimeoutRef.current) {
        clearTimeout(styleTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const isAvailable = (item.available_copies || 0) > 0;

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 hover:bg-gray-700/70 transition-all duration-300 transform hover:scale-105 group">
      <div className="flex items-start justify-between mb-4">
        <div 
          ref={typeBadgeRef}
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getTypeColor(item.item_type_id)}`}
          data-item-id={item.item_id}
          data-debug-type={item.item_type_id}
        >
          {getItemIcon(item.item_type_id)}
          <span className="text-xs font-medium">{getItemTypeName(item.item_type_id)}</span>
        </div>
        
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          isAvailable 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {isAvailable ? `${item.available_copies} available` : 'Out of stock'}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-50 mb-2 group-hover:text-green-400 transition-colors line-clamp-2">
        {item.title}
      </h3>
      
      {item.author_director && (
        <p className="text-gray-300 text-sm mb-4 line-clamp-1">
          by {item.author_director}
        </p>
      )}

      <div className="space-y-3 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm">Rental</span>
          <span className="text-green-400 font-semibold">
            ${item.rental_price_per_day?.toFixed(2)}/day
          </span>
        </div>
        
        {item.purchase_price && (
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Purchase</span>
            <span className="text-teal-400 font-semibold">
              ${item.purchase_price.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          disabled={!isAvailable}
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
            isAvailable
              ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          Rent Now
        </button>
        
        {item.purchase_price && (
          <button
            disabled={!isAvailable}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
              isAvailable
                ? 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-800'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Purchase
          </button>
        )}
      </div>
    </div>
  );
});