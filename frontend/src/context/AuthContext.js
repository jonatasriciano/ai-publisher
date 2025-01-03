// /Users/jonatas/Documents/Projects/ai-publisher/frontend/src/context/AuthContext.js
// Authentication Context for managing authentication state and logic.

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create the authentication context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user data
  const [loading, setLoading] = useState(true); // Manage loading state

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
      if (token && !isTokenExpired(token)) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data.user); // Set user if authentication is valid
        } catch (error) {
          console.error('Authentication check failed:', error);
          logout(); // Log out if authentication fails
        }
      } else {
        logout(); // Log out if no token or token expired
      }
      setLoading(false); // End loading state
    };

    checkAuth(); // Execute authentication check on mount
  }, []);

  // Helper function to check token expiration
  const isTokenExpired = (token) => {
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
      return exp * 1000 < Date.now(); // Validate token expiration
    } catch (error) {
      return true; // Consider token expired if decoding fails
    }
  };

  // Logout function to clear authentication state
  const logout = () => {
    localStorage.removeItem('token'); // Clear token from localStorage
    setUser(null); // Clear user state
  };

  // Function to determine if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token'); // Get token from localStorage
    return token && !isTokenExpired(token); // Check token validity
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, logout, loading }}>
      {!loading && children} {/* Render children only after loading finishes */}
    </AuthContext.Provider>
  );
};

// Hook to access the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext); // Retrieve context
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};