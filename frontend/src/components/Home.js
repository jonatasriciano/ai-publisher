// /frontend/src/components/Home.js

import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container mt-5">
      <header className="text-center mb-4">
        <h1>Welcome to AI Publisher</h1>
        <p className="lead">Simplify the way you publish and manage content across platforms.</p>
      </header>

      <nav className="text-center mb-5">
        <Link to="/login" className="btn btn-primary mx-2">Login</Link>
        <Link to="/register" className="btn btn-outline-primary mx-2">Register</Link>
      </nav>
    </div>
  );
}

export default Home;