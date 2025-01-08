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
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';

    useEffect(() => {
        if (!isAuthenticated()) {
            console.warn('[Upload] User not authenticated. Redirecting to login.');
            navigate('/login');
        } else {
            console.info('[Upload] User authenticated. Fetching uploads...');
            fetchUploads();
        }
    }, [navigate, isAuthenticated]);

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

    const validateFile = (file) => {
        console.info('[ValidateFile] Validating file:', file);
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        const maxSize = 5 * 1024 * 1024;

        if (!file) return 'Please select a file.';
        if (!allowedTypes.includes(file.type)) return 'Invalid file type.';
        if (file.size > maxSize) return 'File size exceeds 5MB limit.';
        return null;
    };

    const handleUpload = async (e) => {
        e.preventDefault();
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
            formData.append('caption', caption);


            // Log the FormData entries
            for (let [key, value] of formData.entries()) {
                console.log(`[FormData] ${key}:`, value);
            }

            console.info('[FormData] Prepared for upload:', { file, platform, caption });

            console.info('[Upload] Sending file to API...');

            const response = await fetch(`${API_URL}/api/posts/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData
            });


                if (response.ok) {
                    const data = await response.json();
                    console.info('[Upload] Success:', data);
                    setUploads((prev) => [...prev, data]);
                    setFile(null);
                    setCaption('');
                    setProgress(0);
                } else {
                    const errorData = await response.json();
                    console.error('[Upload] Error during upload:', errorData);
                    setError(errorData.error || 'Upload failed');
                }

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
                                    <label className="form-label">Caption</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                         placeholder="Enter caption"
                                        value={caption}
                                         onChange={(e) => setCaption(e.target.value)}
                                    />
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