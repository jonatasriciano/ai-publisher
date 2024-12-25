// /Users/jonatas/Documents/Projects/ai-publisher/frontend/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function TestComponent() {
  return <h1>Test Component is Working!</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TestComponent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;