// /Users/jonatas/Documents/Projects/ai-publisher/frontend/src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:9000/api/auth/register', {
        email,
        password
      });
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Registration error');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;