// /Users/jonatas/Documents/Projects/ai-publisher/frontend/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Upload from './components/Upload';
import Approval from './components/Approval';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/register">Register</Link> |{' '}
        <Link to="/login">Login</Link> |{' '}
        <Link to="/upload">Upload</Link> |{' '}
        <Link to="/admin">AdminDashboard</Link>
      </nav>

      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/approval/:postId" element={<Approval />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;