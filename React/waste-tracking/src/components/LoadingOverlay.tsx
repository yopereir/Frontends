import React from 'react';

interface LoadingOverlayProps {
  text: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ text }) => {
  return (
    <div className="loading-overlay">
      <style>
        {`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7); /* Semi-transparent black */
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999; /* Ensure it's on top of everything */
        }

        .loading-content {
          padding: 20px 40px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          color: var(--menu-text);
          font-size: 1.5em;
          font-weight: bold;
        }
        `}
      </style>
      <div className="loading-content">
        <p>{text}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
