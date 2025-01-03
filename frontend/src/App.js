import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import Register from './components/Register';
import Login from './components/Login';
import Upload from './components/Upload';
import Approval from './components/Approval';
import AdminDashboard from './components/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();

  console.log('PrivateRoute - Loading:', loading);
  console.log('PrivateRoute - User:', user);
  console.log('PrivateRoute - isAuthenticated:', isAuthenticated);

  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) {
    console.warn('PrivateRoute - User not authenticated. Redirecting to login.');
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.warn(`PrivateRoute - User does not have required role "${requiredRole}". Redirecting to home.`);
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-container">
            <Navigation />
            
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/upload" />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                
                <Route path="/upload" element={
                  <PrivateRoute>
                    <Upload />
                  </PrivateRoute>
                } />
                
                <Route path="/approval/:postId" element={
                  <PrivateRoute>
                    <Approval />
                  </PrivateRoute>
                } />
                
                <Route path="/admin" element={
                  <PrivateRoute requiredRole="admin">
                    <AdminDashboard />
                  </PrivateRoute>
                } />
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;