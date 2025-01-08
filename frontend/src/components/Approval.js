import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function Approval() {
  const { postId } = useParams(); // Get the postId from the URL
  const [post, setPost] = useState(null); // State for storing the post details
  const [loading, setLoading] = useState(false); // State for tracking the loading status
  const [error, setError] = useState(''); // State for storing any error messages

  useEffect(() => {
    fetchPost(); // Fetch the post details when the component mounts
  }, []);

  const fetchPost = async () => {
    setLoading(true); // Set loading state to true
    setError(''); // Clear previous errors

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token is missing.');
      }

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/posts/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPost(data); // Set the post details in state
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error fetching post details';
      setError(errorMessage); // Set the error message
    } finally {
      setLoading(false); // Set loading state to false
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Details for Post {postId}</h2>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {loading ? (
        <p>Loading post details...</p>
      ) : post ? (
        <div className="card">
          <div className="card-header">
            <h5>Post Information</h5>
          </div>
          <div className="card-body">
            <p><strong>Title:</strong> {post.title || 'No title provided'}</p>
            <p><strong>Content:</strong> {post.content || 'No content available'}</p>
            <p><strong>Status:</strong> 
              <span className={`badge bg-${getPostStatusBadge(post.status)}`}>
                {post.status}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <p>No post details available.</p>
      )}
    </div>
  );
}

// Helper function to determine the badge color for post status
const getPostStatusBadge = (status) => {
  switch (status) {
    case 'published':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'danger';
    default:
      return 'secondary';
  }
};

export default Approval;