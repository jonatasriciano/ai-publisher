import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

function Register() {
  const navigate = useNavigate(); // Hook for redirection

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please try again.');
      setLoading(false);
      return;
    }

    try {
      // Send API request to register endpoint
      const response = await axios.post('/api/register', {
        name: formData.name,
        companyName: formData.companyName,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      console.log('Registration Response:', response.data);

      // Redirect to login page with a success message
      navigate('/login', { state: { message: 'Your registration was successful. Please wait for team approval. You will receive a confirmation email.' } });
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || 'Registration failed');
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Registration Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h2 className="text-center mb-4">Register</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="companyName" className="form-label">Company Name</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              className="form-control"
              placeholder="Enter your company name"
              value={formData.companyName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-control"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;