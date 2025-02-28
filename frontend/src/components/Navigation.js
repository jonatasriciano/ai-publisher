import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeContext from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Handle user logout
  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    navigate('/login'); // Redirect user to the login page
  };

  return (
    <nav
      className={`navbar navbar-expand-lg ${
        theme === 'light' ? 'navbar-light bg-light' : 'navbar-dark bg-dark'
      } shadow-sm`}
    >
      <div className="container-fluid">
        {/* Logo / Brand Name */}
        <Link className="navbar-brand fw-bold" to="/">
          <i className="fas fa-robot me-2"></i>AI Publisher
        </Link>

        {/* Toggler Button for Mobile View */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/upload">
                <i className="fas fa-upload me-2"></i>Upload
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin">
                <i className="fas fa-user-shield me-2"></i>Admin
              </Link>
            </li>
          </ul>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn btn-outline-secondary d-flex align-items-center me-3"
            aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <i className="fas fa-moon me-2"></i>
            ) : (
              <i className="fas fa-sun me-2"></i>
            )}
            {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger d-flex align-items-center"
            aria-label="Logout"
          >
            <i className="fas fa-sign-out-alt me-2"></i>Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
