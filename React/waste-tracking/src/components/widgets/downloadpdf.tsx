import React from 'react';

interface DownloadPDFProps {
  onDownload: () => void;
}

const DownloadPDF: React.FC<DownloadPDFProps> = ({ onDownload }) => {
  return (
    <button onClick={onDownload}>Download PDF</button>
  );
};

export default DownloadPDF;
