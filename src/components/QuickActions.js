import React from 'react';

const QuickActions = ({ onActionClick }) => {
  const actions = [
    { id: 'transcript', title: 'Transcript', description: 'Generate transcript', icon: '📝', color: 'from-blue-500 to-cyan-500', glow: 'glow-gray' },
    { id: 'speed-up', title: 'Speed Up', description: '2x, 1.5x, etc.', icon: '⚡', color: 'from-yellow-500 to-orange-500', glow: 'glow-gray' },
    { id: 'cut-video', title: 'Cut Video', description: 'Time intervals', icon: '✂️', color: 'from-red-500 to-pink-500', glow: 'glow-gray' },
    { id: 'grayscale', title: 'Grayscale', description: 'B&W conversion', icon: '🎨', color: 'from-gray-500 to-gray-600', glow: 'glow-gray' },
    { id: 'enhance-audio', title: 'Enhance Audio', description: 'Remove noise', icon: '🎵', color: 'from-purple-500 to-indigo-500', glow: 'glow-gray' },
    { id: 'merge', title: 'Merge Files', description: 'Combine multiple files', icon: '🔗', color: 'from-green-500 to-teal-500', glow: 'glow-gray' }
  ];

  return (
    <div className="mt-2 relative z-30">
      <div className="grid grid-cols-6 gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.id)}
            className={`p-2 text-xs bg-gradient-to-br from-white/70 to-gray-100/70 hover:from-white/90 hover:to-gray-200/90 rounded-lg transition-all duration-300 hover-lift border border-gray-300/50 hover:border-gray-400/70 group backdrop-blur-sm ${action.glow} shadow-md`}
          >
            <div className="text-lg mb-1 group-hover:scale-110 transition-transform duration-300">
              {action.icon}
            </div>
            <div className="font-medium text-gray-800 group-hover:text-gray-900 transition-colors text-xs">
              {action.title}
            </div>
            <div className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors leading-tight">
              {action.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
