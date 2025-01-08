import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Import global styles and dependencies
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap styles
import './styles/global.css'; // Global custom styles

// Find the root element in the DOM
const container = document.getElementById('root');

// Ensure the root element exists before proceeding
if (container) {
  const root = createRoot(container); // Create React root
  root.render(<App />); // Render the main App component
} else {
  console.error('Root container not found. Make sure there is an element with id="root" in the HTML.');
}