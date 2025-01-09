import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './components/Welcome';
import Register from './components/Register';
import Login from './components/Login';
import Upload from './components/Upload';
import Approval from './components/Approval';
import Edit from './components/Edit';
import { useAuth } from './context/AuthContext';

// PrivateRoute Component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Centralized Routes
const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<Welcome />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* Private Routes */}
    <Route
      path="/upload"
      element={
        <PrivateRoute>
          <Upload />
        </PrivateRoute>
      }
    />
    <Route
      path="/approval/:postId"
      element={
        <PrivateRoute>
          <Approval />
        </PrivateRoute>
      }
    />
    <Route
      path="/edit/:postId"
      element={
        <PrivateRoute>
          <Edit />
        </PrivateRoute>
      }
    />

    {/* Fallback Route */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;