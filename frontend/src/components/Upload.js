// /frontend/src/components/Upload.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner'; // Spinner component
import { useAuth } from '../context/AuthContext'; // Authentication context

function Upload() {
  const [file, setFile] = useState(null); // Selected file state
  const [platform, setPlatform] = useState('LinkedIn'); // Selected platform state
  const [uploads, setUploads] = useState([]); // List of uploaded files
  const [loading, setLoading] = useState(false); // Loading state for uploads
  const [progress, setProgress] = useState(0); // Upload progress state
  const [error, setError] = useState(''); // Error message state
  const navigate = useNavigate(); // Navigation hook
  const { isAuthenticated } = useAuth(); // Authentication status from context
  const token = localStorage.getItem('token'); // Retrieve stored token

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';

  // Check authentication and fetch uploads on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      console.warn('[Upload] User not authenticated. Redirecting to login.');
      navigate('/login');
    } else {
      console.info('[Upload] User authenticated. Fetching uploads...');
      fetchUploads();
    }
  }, [navigate, isAuthenticated]);

  // Fetch uploads from the server
  const fetchUploads = async () => {
    try {
      console.info('[Uploads] Fetching uploads...');
      const response = await axios.get(`${API_URL}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.info('[Uploads] Fetched data:', response.data);
      setUploads(response.data);
    } catch (err) {
      console.error('[Uploads] Error fetching uploads:', err.message);
      setError('Failed to fetch uploads');
    }
  };

  // Validate the uploaded file
  const validateFile = (file) => {
    console.info('[ValidateFile] Validating file:', file);
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024;

    if (!file) return 'Please select a file.';
    if (!allowedTypes.includes(file.type)) return 'Invalid file type.';
    if (file.size > maxSize) return 'File size exceeds 5MB limit.';
    return null;
  };

  // Handle the file upload
  const handleUpload = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError('');
    setLoading(true);
    setProgress(0);

    try {
      if (!token) {
        console.error('[Upload] Missing token. Redirecting to login.');
        navigate('/login');
        return;
      }

      console.info('[Upload] Validating file...');
      if (!file) {
        throw new Error('No file selected.');
      }

      const validationError = validateFile(file);
      if (validationError) throw new Error(validationError);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('platform', platform);
      formData.append('caption', 'Sample caption');

      // Log the FormData entries
      for (let [key, value] of formData.entries()) {
        console.log(`[FormData] ${key}:`, value);
      }

      console.info('[FormData] Prepared for upload:', { file, platform });

      console.info('[Upload] Sending file to API...');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/posts/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true, 
        }
      );

      console.info('[Upload] Success:', response.data);
      setUploads((prev) => [...prev, response.data]);
      setFile(null);
      setProgress(0);
    } catch (err) {
      console.warn('[Upload] API URL:', `${API_URL}/api/posts/upload`);
      console.error('[Upload] Error during upload:', err.message, err.response?.data || err);
      setError(err.response?.data?.error || err.message || 'Upload failed');
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