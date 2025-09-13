import React from 'react';

const FileUpload = ({ onFileSelect, currentFile }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="border-t border-gray-300 bg-gray-200/50 backdrop-blur-xl p-4 relative z-30">
      <div 
        className="border-2 border-dashed border-gray-400 rounded-xl p-8 text-center hover:border-gray-500 transition-all duration-300 hover-lift bg-gradient-to-br from-white/50 to-gray-100/50"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-full flex items-center justify-center glow-gray float">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <p className="text-xl font-medium text-gray-800">
              Drop your video or audio file here
            </p>
            <p className="text-sm text-gray-600 mt-2">
              or{' '}
              <label className="text-gray-700 hover:text-gray-900 underline cursor-pointer transition-colors">
                browse files
                <input
                  type="file"
                  accept="video/*,audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </p>
          </div>

          <div className="text-xs text-gray-500 bg-gray-300/50 px-3 py-1 rounded-full border border-gray-400/50">
            Supports MP4, MOV, AVI, MP3, WAV, and more
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
