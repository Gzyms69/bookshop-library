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
}

export interface ItemType {
  type_id: number;
  type_name: string;
  description?: string;
}