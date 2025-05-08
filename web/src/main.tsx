import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Make sure App.tsx exists in the same directory
import './index.css';     // Optional: import global styles

const rootElement = document.getElementById('root') as HTMLElement;

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
