import React from 'react';
import PropTypes from 'prop-types';

function LoadingSpinner({
  size = 'md',
  color = 'primary',
  text = 'Loading...',
  isLoading = true,
  className = '',
}) {
  const spinnerSizes = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg',
  };

  if (!isLoading) return null;

  return (
    <div className={`d-flex align-items-center justify-content-center ${className}`}>
      <div className={`spinner-border text-${color} ${spinnerSizes[size]}`} role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      {text && <span className="ms-2">{text}</span>}
    </div>
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.string,
  text: PropTypes.string,
  isLoading: PropTypes.bool,
  className: PropTypes.string,
};

export default LoadingSpinner;
