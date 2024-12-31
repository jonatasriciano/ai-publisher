// /Users/jonatas/Documents/Projects/ai-publisher/frontend/src/components/Upload.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Upload() {
  const [file, setFile] = useState(null); // State for selected file
  const [platform, setPlatform] = useState('LinkedIn'); // State for selected platform
  const [uploads, setUploads] = useState([]); // State for list of previous uploads
  const [loading, setLoading] = useState(false); // State for loading status

  // Fetch previous uploads when the component mounts
  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Please login first');
          return;
        }

        const { data } = await axios.get('http://localhost:9000/api/posts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUploads(data);
      } catch (err) {
        console.error(err);
        alert('Error fetching uploads');
      }
    };

    fetchUploads();
  }, []);

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('platform', platform);

      const { data } = await axios.post(
        'http://localhost:9000/api/posts/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(`Upload successful, Post ID: ${data.postId}`);

      // Update the uploads list with the new upload
      setUploads((prevUploads) => [
        ...prevUploads,
        { ...data, status: 'Pending', platform }, // Assuming default status is "Pending"
      ]);
      setFile(null); // Clear the file input
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Upload error');
    } finally {
      setLoading(false); // Set loading state to false
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Upload Photo or Video</h2>

      {/* Upload Form */}
      <div className="card mb-4">
        <div className="card-body">
          <h4>New Upload</h4>
          <form onSubmit={handleUpload}>
            <div className="mb-3">
              <label htmlFor="file" className="form-label">
                Choose File
              </label>
              <input
                type="file"
                id="file"
                accept="image/*,video/*"
                className="form-control"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="platform" className="form-label">
                Choose Platform
              </label>
              <select
                id="platform"
                className="form-select"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Instagram">Instagram</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>
      </div>

      {/* Uploads List */}
      <div className="card">
        <div className="card-body">
          <h4>Your Uploads</h4>
          {uploads.length > 0 ? (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>File Name</th>
                  <th>Platform</th>
                  <th>Status</th>
                  <th>Uploaded At</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((upload, index) => (
                  <tr key={upload.id}>
                    <td>{index + 1}</td>
                    <td>{upload.fileName}</td>
                    <td>{upload.platform}</td>
                    <td>
                      <span
                        className={`badge ${
                          upload.status === 'Approved'
                            ? 'bg-success'
                            : upload.status === 'Rejected'
                            ? 'bg-danger'
                            : 'bg-warning'
                        }`}
                      >
                        {upload.status}
                      </span>
                    </td>
                    <td>{new Date(upload.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center">No uploads found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Upload;