import React from 'react';
import { PlayIcon, PauseIcon, DownloadIcon, TrashIcon, EyeIcon } from 'lucide-react';

const VideoGallery = ({ videoFiles, onPlay, onPause, onDownload, onRemove, onPreview, isPlaying, currentPlayingId }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (duration) => {
    if (!duration || !isFinite(duration)) return '--:--';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (videoFiles.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-gray-300/50 shadow-lg">
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">🎬</div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Processed Video</h3>
          <p className="text-xs">No processed video files yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-gray-300/50 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-800 flex items-center gap-2">
          🎬 Processed Video
          <span className="text-xs text-gray-500">({videoFiles.length})</span>
        </h3>
      </div>
      
      <div className="space-y-1 max-h-20 overflow-y-auto">
        {videoFiles.map((file, index) => {
          const isCurrentlyPlaying = currentPlayingId === file.id;
          const isVideo = file.type?.startsWith('video/') || /\.(mp4|mov|avi|webm|mkv)$/i.test(file.name);
          
          if (!isVideo) return null;
          
          return (
            <div
              key={file.id || index}
              className="flex items-center gap-1.5 p-1.5 bg-gray-50/80 rounded-md border border-gray-200/50 hover:bg-gray-100/80 transition-colors cursor-pointer group"
              onClick={() => isCurrentlyPlaying ? onPause() : onPlay(file)}
            >
              {/* Play/Pause Button */}
              <div className="flex items-center justify-center w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors flex-shrink-0">
                {isCurrentlyPlaying ? (
                  <PauseIcon className="w-2.5 h-2.5" />
                ) : (
                  <PlayIcon className="w-2.5 h-2.5 ml-0.5" />
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(file);
                    }}
                    className="text-xs font-medium text-gray-800 truncate group-hover:text-red-700 transition-colors hover:underline text-left"
                    title={`Download ${file.name || 'file'}`}
                  >
                    {file.name || file.originalName || 'Unknown file'}
                  </button>
                  {isCurrentlyPlaying && (
                    <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded-full">
                      Playing
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {formatFileSize(file.size || file.fileSize || 0)} • {file.type || file.mimeType || 'video/*'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(file);
                  }}
                  className="p-0.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Preview"
                >
                  <EyeIcon className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(file);
                  }}
                  className="p-0.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Download"
                >
                  <DownloadIcon className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(file);
                  }}
                  className="p-0.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remove"
                >
                  <TrashIcon className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VideoGallery;
