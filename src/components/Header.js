import React from 'react';
import logoImage from '../images/logo.png';

const Header = ({ isSidebarOpen, onToggleSidebar, currentFile }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-300 bg-gray-200/80 backdrop-blur-xl relative z-30">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-300/50 rounded-lg transition-all duration-300 hover:glow-gray"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-800">Video Editor Assistant</h2>
      </div>
      
      <div className="flex items-center gap-4">
        {currentFile && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-300/50 px-3 py-2 rounded-lg border border-gray-400/50">
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
            </svg>
            <span className="text-gray-800">{currentFile.name}</span>
          </div>
        )}
        
        
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src={logoImage} 
            alt="Video Editor AI Logo" 
            className="h-12 w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
