import React, { useState } from 'react';
import { UserIcon, LogOutIcon } from 'lucide-react';

const Sidebar = ({ isOpen, onToggle, onNewChat, conversations, onChatSelect, currentChatId, user, onProfileClick, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  return (
    <div className={`${isOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-gray-900/90 backdrop-blur-xl text-white overflow-hidden border-r border-white/20`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <h1 className="text-lg font-semibold text-white">VibeVideo.AI</h1>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 hover:glow-white"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-white/10 to-gray-600/20 hover:from-white/20 hover:to-gray-500/30 rounded-lg transition-all duration-300 hover-lift border border-white/20 hover:border-white/40 glow-white"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-white font-medium">New Chat</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Conversations</h3>
          <div className="space-y-2">
            {conversations.length === 0 ? (
              <div className="p-3 text-center text-gray-400 text-sm">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => (
                <div 
                  key={conversation.id} 
                  onClick={() => onChatSelect(conversation.id)}
                  className={`p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-all duration-300 hover-lift border ${
                    currentChatId === conversation.id 
                      ? 'bg-white/10 border-white/30' 
                      : 'border-transparent hover:border-white/20'
                  } group`}
                >
                  <div className="font-medium text-sm truncate text-gray-200 group-hover:text-white transition-colors">
                    {conversation.title}
                  </div>
                  <div className="text-xs text-gray-400 truncate mt-1 group-hover:text-gray-300 transition-colors">
                    {conversation.preview}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(conversation.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/20">
          <div className="relative">
            <button
              onClick={() => {
                console.log('User button clicked!', { user, showUserMenu });
                if (user) {
                  setShowUserMenu(!showUserMenu);
                } else {
                  console.log('Calling onProfileClick...');
                  onProfileClick();
                }
              }}
              className="w-full flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 border-2 border-yellow-400"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-300 rounded-full flex items-center justify-center glow-white">
                <UserIcon className="w-4 h-4 text-gray-800" />
              </div>
              <span className="text-gray-300">{user || 'User'}</span>
              {user && (
                <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            
            {/* User dropdown menu */}
            {showUserMenu && user && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-lg shadow-lg border border-white/20 py-2 z-50">
                <div className="px-4 py-2 border-b border-white/10">
                  <p className="text-sm font-medium text-white">{user}</p>
                  <p className="text-xs text-gray-400">Logged in</p>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <LogOutIcon className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
