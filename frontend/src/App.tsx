import React, { useEffect, useState } from 'react';
import { getItems, getPricingAnalytics, Item } from './services/api';
import './App.css';

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsData, analyticsData] = await Promise.all([
          getItems(),
          getPricingAnalytics()
        ]);
        setItems(itemsData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="App">Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>BookShop Library Management</h1>
        
        {analytics && (
          <div className="analytics">
            <h2>Pricing Analytics</h2>
            <p>Average Purchase Price: ${analytics.purchase_prices.mean.toFixed(2)}</p>
            <p>Items in Inventory: {items.length}</p>
          </div>
        )}

        <div className="items-grid">
          <h2>Available Items</h2>
          {items.map(item => (
            <div key={item.item_id} className="item-card">
              <h3>{item.title}</h3>
              <p>By: {item.author_director}</p>
              <p>Type: {item.type_name}</p>
              <p>Purchase: ${item.purchase_price}</p>
              <p>Rent: ${item.rental_price_per_day}/day</p>
              <p>Available: {item.available_copies}</p>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;