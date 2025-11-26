import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerPanel from './pages/CustomerPanel';
import AdminPanel from './pages/AdminPanel';
import { DebugPanel } from './components/DebugPanel';
import { initDebug } from './utils/initDebug';
import './App.css';

// Initialize debug logging
initDebug();

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<CustomerPanel />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
        <DebugPanel />
      </div>
    </BrowserRouter>
  );
}

export default App;