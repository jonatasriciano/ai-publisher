// /Users/jonatas/Documents/Projects/ai-publisher/frontend/src/index.js

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.css';

const container = document.getElementById('root');
const root = createRoot(container); // Ensure this line is not throwing errors
root.render(<App />);