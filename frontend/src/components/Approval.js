import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function Approval() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `http://localhost:9000/api/posts/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setPost(data);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(err.response?.data?.error || 'Error fetching post details');
    }
  };

  return (
    <div>
      <h2>Details for Post {postId}</h2>
      {error && <p className="error">{error}</p>}
      {post ? (
        <div>
          <p><strong>Title:</strong> {post.title}</p>
          <p><strong>Content:</strong> {post.content}</p>
          <p><strong>Status:</strong> {post.status}</p>
        </div>
      ) : (
        <p>Loading post details...</p>
      )}
    </div>
  );
}

export default Approval;