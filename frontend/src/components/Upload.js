import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../context/AuthContext';

function Upload() {
    const [file, setFile] = useState(null);
    const [platform, setPlatform] = useState('LinkedIn');
    const [caption, setCaption] = useState('');
    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
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
            const response = await axios.get(`${API_URL}/api/posts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUploads(response.data);
        } catch {
            setError('Failed to fetch uploads');
        }
    };

    const validateFile = (file) => {
        if (!file) return 'Please select a file.';
        if (!ALLOWED_FILE_TYPES.includes(file.type)) return 'Invalid file type.';
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
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

            if (response.ok) {
                const data = await response.json();
                setUploads((prev) => [...prev, data]);
                setFile(null);
                setCaption('');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Upload failed');
            }
        } catch (err) {
            setError(err.message || 'Upload failed');
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
                            {error && <div className="alert alert-danger" role="alert">{error}</div>}

                            <form onSubmit={handleUpload}>
                                <div className="mb-3">
                                    <label className="form-label">Platform</label>
                                    <select
                                        className="form-select"
                                        value={platform}
                                        onChange={(e) => setPlatform(e.target.value)}
                                        aria-label="Select platform for upload"
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
                                        placeholder="Enter caption"
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        aria-label="Enter caption for upload"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">File</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept={ALLOWED_FILE_TYPES.join(',')}
                                        onChange={(e) => setFile(e.target.files[0])}
                                        aria-label="Choose file for upload"
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
                                    aria-disabled={loading || !file}
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