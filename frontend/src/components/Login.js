// /Users/jonatas/Documents/Projects/ai-publisher/frontend/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom'; // Import React Router's useNavigate and useLocation

function Login() {
  const [email, setEmail] = useState(''); // State for email input
  const [password, setPassword] = useState(''); // State for password input
  const [error, setError] = useState(''); // State for error messages
  const location = useLocation(); // Access location for passed state
  const navigate = useNavigate(); // Navigate hook for redirection
  const message = location.state?.message; // Extract message passed via navigation

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const { data } = await axios.post('http://localhost:9000/api/auth/login', {
        email,
        password,
      });

      // Save token in localStorage
      localStorage.setItem('token', data.token);

      if (data.approved) {
        // Redirect to upload page if approved
        navigate('/upload');
      } else {
        // Display message if not approved
        alert('You are NOT approved yet.');
      }
    } catch (err) {
      // Set error message if login fails
      setError(err.response?.data?.error || 'Login error');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="text-center mb-4">Login</h2>

              {/* Display message passed from register */}
              {message && (
                <div className="alert alert-info text-center">{message}</div>
              )}

              {/* Display error messages */}
              {error && <div className="alert alert-danger text-center">{error}</div>}

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;