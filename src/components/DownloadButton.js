import React from 'react';
import { DownloadIcon } from 'lucide-react';

const DownloadButton = ({ file, filename, className = "" }) => {
  const handleDownload = () => {
    try {
      // Create a blob URL for the file
      const url = URL.createObjectURL(file);
      
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || file.name || 'processed_file';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      URL.revokeObjectURL(url);
      
      console.log('Download started:', filename || file.name);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 ${className}`}
    >
      <DownloadIcon className="w-4 h-4" />
      Download Processed File
    </button>
  );
};

export default DownloadButton;
