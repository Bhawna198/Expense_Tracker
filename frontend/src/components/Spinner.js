import React from 'react';

const Spinner = ({ size = 'medium', text = 'Loading...', fullPage = false }) => {
  const sizeClass = {
    small: 'spinner-sm',
    medium: 'spinner-md',
    large: 'spinner-lg'
  }[size] || 'spinner-md';

  const spinnerContent = (
    <div className={`spinner ${sizeClass}`}>
      <div className="spinner-border" role="status">
        <span className="sr-only">Loading...</span>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="spinner-container">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default Spinner;