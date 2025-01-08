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

// PrivateRoute component to restrict access to authenticated users
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Show loading spinner while authentication state is being determined
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Redirect to login if user is not authenticated
    console.warn('PrivateRoute - User not authenticated. Redirecting to login.');
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-container">
            {/* Navigation Bar */}
            <Navigation />

            <main className="main-content">
              <Routes>
                {/* Redirect root path to /upload */}
                <Route path="/" element={<Navigate to="/upload" />} />

                {/* Public Routes */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
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
                  <PrivateRoute>
                    <AdminDashboard />
                  </PrivateRoute>
                } />

                {/* Fallback Route */}
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