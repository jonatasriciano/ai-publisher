import React from 'react';
import { Link } from 'react-router-dom';

function Welcome() {
  return (
    <div className="container d-flex flex-column align-items-center justify-content-center vh-100 text-center">
      <h1 className="mb-4">Welcome to AI Publisher!</h1>
      <p className="mb-4">
        Simplify your social media management with AI-generated captions, tags, and automated publishing.
      </p>
      <div>
        <Link
          to="/register"
          className="btn btn-primary me-2"
          aria-label="Go to registration page"
        >
          Register
        </Link>
        <Link
          to="/login"
          className="btn btn-secondary"
          aria-label="Go to login page"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

export default Welcome;