import { useState, useCallback } from 'react';
import axios from 'axios';

const useFileUpload = (options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    endpoint = '/api/upload'
  } = options;

  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateFile = useCallback((file) => {
    if (!file) return 'No file selected';
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type';
    }
    if (file.size > maxSize) {
      return 'File size exceeds limit';
    }
    return null;
  }, [allowedTypes, maxSize]);

  const handleFileSelect = useCallback((selectedFile) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return false;
    }
    setFile(selectedFile);
    setError(null);
    return true;
  }, [validateFile]);

  const uploadFile = useCallback(async (additionalData = {}) => {
    if (!file) {
      setError('No file selected');
      return null;
    }

    setLoading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const { data } = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentage);
        }
      });

      setFile(null);
      setProgress(100);
      return data;

    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [file, endpoint]);

  const reset = useCallback(() => {
    setFile(null);
    setProgress(0);
    setError(null);
    setLoading(false);
  }, []);

  return {
    file,
    progress,
    error,
    loading,
    handleFileSelect,
    uploadFile,
    reset,
    isValidFile: (file) => !validateFile(file)
  };
};

export default useFileUpload;