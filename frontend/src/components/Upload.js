// /Users/jonatas/Documents/Projects/ai-publisher/frontend/src/components/Upload.js
import React, { useState } from 'react';
import axios from 'axios';

function Upload() {
  const [file, setFile] = useState(null);
  const [platform, setPlatform] = useState('LinkedIn');

  const handleUpload = async (e) => {
    e.preventDefault();
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
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(`Upload successful, Post ID: ${data.postId}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Upload error');
    }
  };

  return (
    <div>
      <h2>Upload Photo or Video</h2>
      <form onSubmit={handleUpload}>
        <input 
          type="file" 
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <br/>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Instagram">Instagram</option>
        </select>
        <br/>
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}

export default Upload;