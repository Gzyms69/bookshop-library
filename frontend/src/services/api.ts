import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Item {
  item_id: number;
  title: string;
  author_director: string;
  type_name: string;
  purchase_price: number;
  rental_price_per_day: number;
  available_copies: number;
}

export const getItems = async (): Promise<Item[]> => {
  const response = await api.get('/items');
  return response.data.items;
};

export const getPricingAnalytics = async () => {
  const response = await api.get('/analytics/pricing');
  return response.data;
};