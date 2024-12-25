// /Users/jonatas/Documents/Projects/ai-publisher/frontend/src/components/AdminDashboard.js
import React, { useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');

  const approveUser = async () => {
    try {
      const { data } = await axios.post('http://localhost:9000/api/auth/approve', { userId });
      setMessage(data.message);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || 'Approval error');
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <input 
        type="text" 
        placeholder="User ID to approve"
        value={userId}
        onChange={(e) => setUserId(e.target.value)} 
      />
      <button onClick={approveUser}>Approve User</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AdminDashboard;