import { useState, useCallback } from 'react';
import axios from 'axios';

const useFileUpload = (options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    endpoint = '/api/upload',
  } = options;

  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Validates the selected file against the allowed types and size.
   * @param {File} file - File to validate.
   * @returns {string|null} Error message or null if valid.
   */
  const validateFile = useCallback(
    (file) => {
      if (!file) return 'No file selected';
      if (!allowedTypes.includes(file.type)) {
        return 'Invalid file type';
      }
      if (file.size > maxSize) {
        return `File size exceeds ${maxSize / (1024 * 1024)}MB limit`;
      }
      return null;
    },
    [allowedTypes, maxSize]
  );

  /**
   * Handles file selection and validation.
   * @param {File} selectedFile - File selected by the user.
   * @returns {boolean} True if the file is valid, otherwise false.
   */
  const handleFileSelect = useCallback(
    (selectedFile) => {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return false;
      }
      setFile(selectedFile);
      setError(null);
      return true;
    },
    [validateFile]
  );

  /**
   * Uploads the selected file to the server.
   * @param {Object} additionalData - Additional data to send with the file.
   * @returns {Object} Response data from the server.
   */
  const uploadFile = useCallback(
    async (additionalData = {}) => {
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
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentage);
          },
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
    },
    [file, endpoint]
  );

  /**
   * Resets the file upload state.
   */
  const reset = useCallback(() => {
    setFile(null);
    setProgress(0);
    setError(null);
    setLoading(false);
  }, []);

  /**
   * Checks if a file is valid without setting it.
   * @param {File} file - File to validate.
   * @returns {boolean} True if the file is valid, otherwise false.
   */
  const isValidFile = useCallback(
    (file) => !validateFile(file),
    [validateFile]
  );

  return {
    file,
    progress,
    error,
    loading,
    handleFileSelect,
    uploadFile,
    reset,
    isValidFile,
  };
};

export default useFileUpload;