// /Users/jonatas/Documents/Projects/ai-publisher/frontend/src/components/Upload.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

function Upload() {
  const [file, setFile] = useState(null);
  const [platform, setPlatform] = useState('LinkedIn');
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  // Function to check if the user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');

    console.log('Token found:', token);
    if (!token) return false;
  
    try {
      // Decode JWT payload
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode payload
      console.log('Decoded token payload:', payload);
  
      const isTokenExpired = payload.exp * 1000 < Date.now(); // Check token expiration
      console.log('Is token expired?', isTokenExpired);
      return !isTokenExpired;
    } catch (err) {
      console.error('Token validation error:', err);
      return false;
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('User is not authenticated, redirecting to login.');
      navigate('/login');
    } else {
      console.log('User is authenticated, fetching uploads.');
      fetchUploads();
    }
  }, [navigate]);

  const fetchUploads = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login.');
        navigate('/login');
        return;
      }
  
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/posts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
  
      console.log('Fetched uploads:', data);
      setUploads(data);
    } catch (err) {
      console.error('Error fetching uploads:', err);
      setError(err.response?.data?.error || 'Error fetching uploads');
      if (err.response?.status === 401) {
        console.log('Unauthorized, redirecting to login.');
        navigate('/login'); // Redirect if unauthorized
      }
    }
  };

  const validateFile = (file) => {
    if (!file) return 'Please select a file';
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Only JPG, PNG, and PDF allowed.';
    }
    if (file.size > maxSize) {
      return 'File size exceeds 5MB limit.';
    }
    return null;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setProgress(0);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const fileError = validateFile(file);
      if (fileError) {
        throw new Error(fileError);
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('platform', platform);

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/posts/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      setUploads((prev) => [...prev, data]);
      setFile(null);
      setProgress(0);
      alert('Upload successful!');
    } catch (err) {
      setError(err.message || 'Upload failed');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title">Upload Content</h3>
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleUpload}>
                <div className="mb-3">
                  <label className="form-label">Platform</label>
                  <select
                    className="form-select"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Twitter">Twitter</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">File</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </div>

                {progress > 0 && (
                  <div className="mb-3">
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                      >
                        {progress}%
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading || !file}
                >
                  {loading ? <LoadingSpinner /> : 'Upload'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title">Recent Uploads</h3>
              {uploads.length > 0 ? (
                <ul className="list-group">
                  {uploads.map((upload) => (
                    <li
                      key={upload._id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>{upload.platform}</span>
                      <span
                        className={`badge bg-${
                          upload.status === 'pending' ? 'warning' : 'success'
                        }`}
                      >
                        {upload.status}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted">No uploads yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;