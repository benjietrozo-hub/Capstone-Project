import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/mobile.css';
import { initializeErrorHandling } from './utils/errorHandler';
import './utils/websocketHelper.js';

// Initialize global error handling
initializeErrorHandling();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
