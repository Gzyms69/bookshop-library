import React from 'react';
import CustomerPanel from './pages/CustomerPanel';
import { DebugPanel } from './components/DebugPanel';
import { initDebug } from './utils/initDebug';
import './App.css';

// Initialize debug logging
initDebug();

function App() {
  return (
    <div className="App">
      <CustomerPanel />
      <DebugPanel />
    </div>
  );
}

export default App;