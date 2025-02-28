import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function Edit() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [platform, setPlatform] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!token) throw new Error('Authentication token is missing.');

      const { data } = await axios.get(`${API_URL}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost(data);
      setPlatform(data.platform);
      setCaption(data.caption);
      setTags(data.tags.join(', '));
      setDescription(data.description || '');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch post details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updatedPost = {
        platform,
        caption,
        tags: tags.split(',').map((tag) => tag.trim()),
        description,
      };

      if (!token) throw new Error('Authentication token is missing.');

      await axios.put(`${API_URL}/api/posts/${postId}`, updatedPost, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Post updated successfully!');
      setTimeout(() => navigate(`/approval/${postId}`), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (filePath) => {
    if (filePath.startsWith('/app')) {
      filePath = filePath.replace('/app', '');
    }
    return `${process.env.REACT_APP_API_URL}${filePath}`;
  };

  return (
    <div className="container mt-4">
      <h2>Edit Post {postId}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {loading && <p>Loading...</p>}

      {post && (
        <form onSubmit={handleUpdate}>
          <div className="col-lg-6">
            <img
              src={getImageUrl(post.filePath)}
              alt={post.caption}
              className="img-fluid rounded shadow"
              style={{ maxHeight: '300px', objectFit: 'cover' }}
            />
          </div>
          <div className="my-3">
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
            <textarea
              className="form-control"
              rows="3"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            ></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Tags</label>
            <input
              type="text"
              className="form-control"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Comma-separated tags"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Post'}
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-3"
            onClick={() => navigate(`/approval/${postId}`)}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

export default Edit;
