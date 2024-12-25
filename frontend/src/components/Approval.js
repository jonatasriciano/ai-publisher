// /Users/jonatas/Documents/Projects/ai-publisher/frontend/src/components/Approval.js
import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function Approval() {
  const { postId } = useParams();
  const [teamResponse, setTeamResponse] = useState('');
  const [clientResponse, setClientResponse] = useState('');

  const approveByTeam = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        'http://localhost:9000/api/posts/approve/team',
        { postId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setTeamResponse(data.message);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Team approval error');
    }
  };

  const approveByClient = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        'http://localhost:9000/api/posts/approve/client',
        { postId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setClientResponse(data.message);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Client approval error');
    }
  };

  return (
    <div>
      <h2>Approval for Post {postId}</h2>
      <button onClick={approveByTeam}>Team Approve</button> 
      {teamResponse && <p>{teamResponse}</p>}

      <button onClick={approveByClient}>Client Approve</button>
      {clientResponse && <p>{clientResponse}</p>}
    </div>
  );
}

export default Approval;