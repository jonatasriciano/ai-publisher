// /Users/jonatas/Documents/Projects/ai-publisher/frontend/src/components/Upload.js
// File Upload Component for handling user uploads.

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../context/AuthContext'; // Import authentication context

function Upload() {
  const [file, setFile] = useState(null); // State for file to be uploaded
  const [platform, setPlatform] = useState('LinkedIn'); // State for selected platform
  const [uploads, setUploads] = useState([]); // State for uploaded files
  const [loading, setLoading] = useState(false); // Loading state
  const [progress, setProgress] = useState(0); // Progress state for uploads
  const [error, setError] = useState(''); // Error state
  const navigate = useNavigate(); // Navigation hook
  const { isAuthenticated } = useAuth(); // Get authentication status from AuthContext
  const token = localStorage.getItem('token'); // Retrieve token

  

  // Ensure user is authenticated on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('User is not authenticated. Redirecting to login.');
      navigate('/login'); // Redirect unauthenticated user
    } else {
      console.log('User authenticated. Fetching uploads.');
      fetchUploads(); // Fetch existing uploads for authenticated users
    }
  }, [navigate, isAuthenticated]);

  // Function to fetch uploads from the server
  const fetchUploads = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Ensure the token is valid
          'Content-Type': 'application/json',
        },
      });

      const textResponse = await response.text(); // Get the raw text response for debugging
      console.log('Raw response:', textResponse);

      if (!response.ok) {
        const error = JSON.parse(textResponse); // Attempt to parse as JSON
        console.error('Error fetching uploads:', error);
        throw new Error(error.error || 'Unknown error occurred');
      }

      const data = JSON.parse(textResponse); // Parse as JSON
      console.log('Fetched uploads:', data);
      setUploads(data); // Update state with parsed data
    } catch (error) {
      console.error('Error in fetchUploads:', error.message);
      setError('Failed to fetch uploads');
    }
  };

  // Function to validate the uploaded file
  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']; // Allowed MIME types
    const maxSize = 5 * 1024 * 1024; // Maximum file size: 5MB

    if (!file) return 'Please select a file.';
    if (!allowedTypes.includes(file.type)) return 'Invalid file type.';
    if (file.size > maxSize) return 'File size exceeds 5MB limit.';
    return null;
  };

  // Function to handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();
    setError(''); // Reset error state
    setLoading(true); // Set loading state
    setProgress(0); // Reset progress state

    try {
      if (!token) {
        console.log('No token found. Redirecting to login.');
        navigate('/login'); // Redirect if token is missing
        return;
      }

      const validationError = validateFile(file); // Validate file
      if (validationError) throw new Error(validationError);

      const formData = new FormData();
      formData.append('file', file); // Append file to form data
      formData.append('platform', platform); // Append platform to form data

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/posts/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (event) => {
          const percentCompleted = Math.round((event.loaded * 100) / event.total);
          setProgress(percentCompleted); // Update progress state
        },
      });

      setUploads((prev) => [...prev, response.data]); // Update uploads list
      setFile(null); // Reset file input
      setProgress(0); // Reset progress
      alert('Upload successful!'); // Notify user of success
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed'); // Display error message
    } finally {
      setLoading(false); // Reset loading state
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
                      <div className="progress-bar" style={{ width: `${progress}%` }}>
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
                      <span className={`badge bg-${upload.status === 'pending' ? 'warning' : 'success'}`}>
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