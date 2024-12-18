import React from 'react';

function Login() {
  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Login Page</h2>
      <form>
        <div>
          <label>Email:</label>
          <input type="email" placeholder="Enter your email" />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" placeholder="Enter your password" />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;