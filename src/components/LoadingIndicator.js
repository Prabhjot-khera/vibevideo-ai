import React from 'react';

const LoadingIndicator = () => {
  return (
    <div className="flex justify-start mb-4 relative z-30">
      <div className="flex gap-3 max-w-3xl">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 glow-gray flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="bg-white/95 backdrop-blur-sm border border-gray-300/50 rounded-2xl px-4 py-3 shadow-lg">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce glow-gray"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce glow-gray" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce glow-gray" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
