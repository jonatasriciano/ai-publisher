// /Users/jonatas/Documents/Projects/ai-publisher/frontend/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [approved, setApproved] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:9000/api/auth/login', {
        email,
        password
      });
      alert(data.message);
      localStorage.setItem('token', data.token);
      setApproved(data.approved);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Login error');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
        />
        <br/>
        <input 
          type="password" 
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
        />
        <br/>
        <button type="submit">Login</button>
      </form>
      {approved && <p>You are approved to upload.</p>}
      {!approved && <p>You are NOT approved yet.</p>}
    </div>
  );
}

export default Login;