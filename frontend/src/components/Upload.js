import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function Upload() {
  const [file, setFile] = useState(null);
  const [platform, setPlatform] = useState('LinkedIn');
  const [caption, setCaption] = useState('');
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL;

  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
  const MAX_FILE_SIZE_MB = 5;

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      fetchUploads();
    }
  }, [navigate, isAuthenticated]);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUploads(response.data);
    } catch {
      setError('Failed to fetch uploads');
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file) => {
    if (!file) return 'Please select a file.';
    if (!ALLOWED_FILE_TYPES.includes(file.type)) return 'Invalid file type.';
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024)
      return `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
    return null;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const validationError = validateFile(file);
      if (validationError) throw new Error(validationError);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('platform', platform);
      formData.append('caption', caption);

      const response = await fetch(`${API_URL}/api/posts/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error occurred during upload.');
      }

      const data = await response.json();
      setUploads((prev) => [...prev, data]);
      setFile(null);
      setCaption('');
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/posts/${postId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedPost = response.data;
      setUploads((prev) =>
        prev.map((upload) => (upload._id === postId ? updatedPost : upload))
      );
    } catch (error) {
      console.error('[Approve Error]', error);
      setError('Failed to approve the post.');
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${API_URL}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUploads((prev) => prev.filter((upload) => upload._id !== postId));
    } catch (error) {
      console.error('[Delete Error]', error);
      setError('Failed to delete the post.');
    }
  };

  return (
    <div className="container mt-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">
          <i className="fas fa-file-upload me-2"></i> Upload Dashboard
        </h2>
        <button
          className="btn btn-primary d-flex align-items-center"
          onClick={() => setShowModal(true)}
        >
          <i className="fas fa-upload me-2"></i> New Upload
        </button>
      </div>

      {/* Upload List */}
      <div className="row">
        <div className="col-md-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h3 className="card-title text-secondary">Uploads</h3>
              {loading && <LoadingSpinner />}
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i> {error}
                </div>
              )}
              {uploads.length > 0 ? (
                <table className="table table-hover table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Platform</th>
                      <th>Status</th>
                      <th>Uploader</th>
                      <th>Uploaded</th>
                      <th>Generated Caption</th>
                      <th>Generated Tags</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploads.map((upload, index) => (
                      <tr key={upload._id}>
                        <td>{index + 1}</td>
                        <td>{upload.platform}</td>
                        <td>
                          <span
                            className={`badge bg-${
                              upload.status === 'pending'
                                ? 'warning'
                                : upload.status === 'team_approved'
                                ? 'info'
                                : upload.status === 'client_approved'
                                ? 'success'
                                : 'secondary'
                            }`}
                          >
                            {upload.status}
                          </span>
                        </td>
                        <td>{upload.userId?.name || 'Unknown'}</td>
                        <td>
                          {new Date(upload.createdAt).toLocaleString().toUpperCase()}
                        </td>
                        <td>
                          {upload.caption.length > 0 ? (
                            <i className="fas fa-check text-success"></i>
                          ) : (
                            <i className="fas fa-times text-danger"></i>
                          )}
                        </td>
                        <td>
                          {upload.tags.length > 0 ? upload.tags.length : '-'}
                        </td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => navigate(`/approval/${upload._id}`)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => navigate(`/edit/${upload._id}`)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleApprove(upload._id)}
                              disabled={upload.status !== 'pending'}
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(upload._id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center">
                  <p className="text-muted">
                    <i className="fas fa-info-circle me-2"></i> No uploads yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-plus-circle me-2"></i> New Upload
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
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
                    <label className="form-label">Caption</label>
                    <input
                      type="text"
                      className="form-control"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">File</label>
                    <input
                      type="file"
                      className="form-control"
                      accept={ALLOWED_FILE_TYPES.join(',')}
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </div>

                  {progress > 0 && (
                    <div className="progress mb-3">
                      <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                      >
                        {progress}%
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
        </div>
      )}
    </div>
  );
}

export default Upload;