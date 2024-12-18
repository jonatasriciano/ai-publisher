// /frontend/src/routes/AppRoutes.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../components/Home'; // Home Page
import Register from '../components/Register'; // Register Page

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default AppRoutes;