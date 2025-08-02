import React, { useState, useEffect } from 'react';

const Alert = ({ message, type = 'info', timeout = 5000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Reset visibility when message changes
    setVisible(true);
    
    // Set up auto-dismiss timer if timeout is provided
    if (timeout > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) setTimeout(onClose, 300); // Allow animation to complete
      }, timeout);
      
      return () => clearTimeout(timer);
    }
  }, [message, timeout, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) setTimeout(onClose, 300); // Allow animation to complete
  };

  // If no message, don't render
  if (!message) return null;

  return (
    <div className={`alert alert-${type} ${visible ? 'visible' : 'hidden'}`}>
      <div className="alert-content">{message}</div>
      <button className="alert-close" onClick={handleClose} aria-label="Close alert">
        &times;
      </button>
    </div>
  );
};

// Component to manage multiple alerts
export const AlertManager = ({ alerts, removeAlert }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="alert-container">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          message={alert.message}
          type={alert.type}
          timeout={alert.timeout}
          onClose={() => removeAlert(alert.id)}
        />
      ))}
    </div>
  );
};

export default Alert;