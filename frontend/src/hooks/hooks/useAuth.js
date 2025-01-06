import { useState, useEffect } from 'react';
import axios from 'axios';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setUser(data.user);
    } catch (err) {
      localStorage.removeItem('token');
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

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
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAdmin,
    isAuthenticated: !!user
  };
};

export default useAuth;