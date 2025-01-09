import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function Approval() {
  const { postId } = useParams(); // Get the postId from the URL
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/posts/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPost(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch post');
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
    <div className="container mt-5">
      <h2 className="text-primary mb-4">
        <i className="fas fa-file-alt me-2"></i> Approval for Post {postId}
      </h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : post ? (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="fas fa-info-circle me-2"></i> Post Details
            </h5>
          </div>
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-lg-6">
                <p>
                  <strong>Platform:</strong> {post.platform}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span
                    className={`badge bg-${
                      post.status === 'pending'
                        ? 'warning'
                        : post.status === 'approved'
                        ? 'success'
                        : 'secondary'
                    }`}
                  >
                    {post.status}
                  </span>
                </p>
                <p>
                  <strong>Uploaded By:</strong>{' '}
                  {post.userId?.name || 'Unknown'}
                </p>
                <p>
                  <strong>Tags:</strong>{' '}
                  {post.tags.length > 0 ? (
                    post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="badge bg-secondary me-1"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    'No tags available'
                  )}
                </p>
              </div>
              <div className="col-lg-6 text-center">
                <img
                  src={getImageUrl(post.filePath)}
                  alt={post.caption}
                  className="img-fluid rounded shadow"
                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                />
              </div>
            </div>

            <p>
              <strong>Caption:</strong>
            </p>
            <blockquote className="blockquote">
              <p>{post.caption}</p>
            </blockquote>
          </div>
        </div>
      ) : (
        <div className="alert alert-warning" role="alert">
          <i className="fas fa-info-circle me-2"></i> No details found for this
          post.
        </div>
      )}
    </div>
  );
}

export default Approval;