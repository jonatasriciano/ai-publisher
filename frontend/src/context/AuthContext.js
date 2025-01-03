// /Users/jonatas/Documents/Projects/ai-publisher/frontend/src/context/AuthContext.js
// React Context for Authentication Management
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create a Context for authentication
const AuthContext = createContext(null);

// AuthProvider component to manage authentication state and logic
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State to store the authenticated user's data
  const [loading, setLoading] = useState(true); // Loading state for authentication checks

  // Run authentication check on component mount
  useEffect(() => {
    console.log('AuthProvider - Initializing authentication check...');
    checkAuth();
  }, []);
  
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
      return payload.exp * 1000 < Date.now(); // Check expiration
    } catch (err) {
      console.error('Error decoding token:', err);
      return true; // Treat as expired
    }
  };
  
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      console.warn('Token missing or expired. Logging out.');
      localStorage.removeItem('token');
      setLoading(false);
      return;
    }
  
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API Response:', response);
      setUser(response.data.user);  // Make sure user data is correctly set
    } catch (error) {
      console.error('Failed to authenticate user:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to log in the user
  const login = async (token, userData) => {
    console.log('Saving token to localStorage:', token);
    localStorage.setItem('token', token);
    setUser(userData);
    console.log('User data set in context:', userData);
  };

  // Function to log out the user
  const logout = () => {
    localStorage.removeItem('token'); // Remove the token from localStorage
    setUser(null); // Clear the user data
  };

  // Context value to be shared with components
  const value = {
    user, // Authenticated user data
    loading, // Loading state
    login, // Login function
    logout, // Logout function
    isAuthenticated: !!user, // Boolean to check if the user is authenticated
    isAdmin: user?.role === 'admin', // Boolean to check if the user is an admin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Render children only after loading is complete */}
    </AuthContext.Provider>
  );
};

// Hook to access the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};