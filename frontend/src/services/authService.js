// /frontend/src/services/authService.js

import axios from 'axios';

// Service: User registration
export const registerUser = async (formData) => {
  try {
    const response = await axios.post('http://localhost:3001/api/register', formData);
    return response.data; // Success response
  } catch (error) {
    throw error.response?.data?.message || 'An error occurred. Please try again.'; // Handle errors
  }
};