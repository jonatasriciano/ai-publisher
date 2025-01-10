import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function VerifyEmail() {
  const { verificationToken } = useParams(); // Get token from URL
  const [status, setStatus] = useState('verifying'); // Status: verifying, success, error
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/verify/${verificationToken}`);
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000); // Redirect after 3 seconds
      } catch (error) {
        setStatus('error');
      }
    };

    verifyEmail();
  }, [verificationToken, navigate]);

  return (
    <div className="container mt-4">
      {status === 'verifying' && <p>Verifying your email...</p>}
      {status === 'success' && (
        <div className="alert alert-success">
          Email verified successfully! Redirecting to login...
        </div>
      )}
      {status === 'error' && (
        <div className="alert alert-danger">
          Failed to verify email. Please try again or contact support.
        </div>
      )}
    </div>
  );
}

export default VerifyEmail;