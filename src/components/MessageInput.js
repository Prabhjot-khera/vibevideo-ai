import React, { useState } from 'react';

const MessageInput = ({ 
  inputMessage, 
  setInputMessage, 
  onSendMessage, 
  isLoading,
  onFileSelect,
  onMultipleFileSelect,
  currentFile,
  currentFiles
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    console.log('📁 File input change:', {
      fileCount: files.length,
      fileNames: files.map(f => f.name),
      files: files
    });
    if (files.length === 1) {
      console.log('📁 Single file selected via file input');
      onFileSelect(files[0]);
    } else if (files.length > 1) {
      console.log('📁 Multiple files selected via file input');
      onMultipleFileSelect(files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    console.log('📁 Drag and drop files:', {
      fileCount: files.length,
      fileNames: files.map(f => f.name),
      files: files
    });
    if (files.length === 1) {
      console.log('📁 Single file selected via drag and drop');
      onFileSelect(files[0]);
    } else if (files.length > 1) {
      console.log('📁 Multiple files selected via drag and drop');
      onMultipleFileSelect(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  return (
    <div className="border-t border-gray-300 bg-gray-200/50 backdrop-blur-xl p-4 relative z-30">
      {/* File Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-xl p-4 mb-4 transition-all duration-300 ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50/50' 
            : 'border-gray-300 bg-white/30 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div className="flex-1">
            {currentFiles && currentFiles.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">
                  📁 {currentFiles.length} file{currentFiles.length > 1 ? 's' : ''} selected
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {currentFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                      <span>• {file.name}</span>
                      <span className="text-gray-400">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : currentFile ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  📁 {currentFile.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({(currentFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">
                  {isDragOver ? 'Drop your files here' : 'Drag & drop files or click to browse'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports MP4, MOV, AVI, MP3, WAV, and more. Select multiple files to merge.
                </p>
              </div>
            )}
          </div>
          
          <label className="text-sm text-gray-600 hover:text-gray-800 underline cursor-pointer transition-colors">
            Browse
            <input
              type="file"
              accept="video/*,audio/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={onSendMessage} className="flex gap-3">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Describe what you want to do with your video/audio..."
          className="flex-1 px-4 py-3 bg-white/70 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-gray-400/70 transition-all duration-300 text-gray-800 placeholder-gray-500 backdrop-blur-sm shadow-lg"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover-lift glow-gray font-medium shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Sending...
            </div>
          ) : (
            'Send'
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
