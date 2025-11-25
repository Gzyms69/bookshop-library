import React from 'react';
import { ItemCard } from './ItemCard';
import { Item } from '../types';

interface ItemGridProps {
  items: Item[];
}

export const ItemGrid: React.FC<ItemGridProps> = React.memo(function ItemGrid({ items }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard key={item.item_id} item={item} />
      ))}
    </div>
  );
});