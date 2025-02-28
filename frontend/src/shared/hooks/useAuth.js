import { useState, useEffect } from 'react';
import axios from 'axios';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthStatus(token);
    } else {
      setLoading(false); // No token, no need to check
    }
  }, []);

  /**
   * Checks the current authentication status by validating the token.
   * @param {string} token - JWT token from localStorage.
   */
  const checkAuthStatus = async (token) => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data.user);
    } catch (err) {
      handleLogout(); // Clear token on authentication failure
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logs in the user by sending their credentials to the backend.
   * @param {Object} credentials - The user's email and password.
   * @returns {Object} - The logged-in user's data.
   */
  const login = async (credentials) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        credentials
      );
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err; // Allow the caller to handle errors
    }
  };

  /**
   * Logs out the current user by clearing the token and user data.
   */
  const logout = () => {
    handleLogout();
  };

  /**
   * Helper to clear token and user state during logout or authentication failure.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  /**
   * Checks if the current user has admin privileges.
   * @returns {boolean} - True if the user is an admin.
   */
  const isAdmin = () => user?.role === 'admin';

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAdmin,
    isAuthenticated: !!user,
  };
};

export default useAuth;
