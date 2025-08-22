import React from 'react';

interface DownloadPDFProps {
  onDownload: () => void;
  className?: string; // Add className prop
}

const DownloadPDF: React.FC<DownloadPDFProps> = ({ onDownload, className }) => {
  return (
    <button onClick={onDownload} className={className}>Download PDF</button>
  );
};

export default DownloadPDF;
