import React from 'react';
import { PlayIcon, DownloadIcon, TrashIcon, EyeIcon } from 'lucide-react';

const VideoGallery = ({ videoFiles, onDownload, onRemove, onPreview }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };


  // Function to open video in popup window
  const openVideoInPopup = (file) => {
    console.log('Opening video in popup:', {
      name: file.name,
      type: file.type,
      size: file.size,
      isFile: file instanceof File,
      isBlob: file instanceof Blob
    });
    
    const videoUrl = URL.createObjectURL(file);
    console.log('Created video URL:', videoUrl);
    
    const popup = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
    
    if (popup) {
      popup.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Video Player - ${file.name}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              background: #000;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              font-family: Arial, sans-serif;
            }
            .video-container {
              max-width: 100%;
              max-height: 100%;
              position: relative;
            }
            video {
              max-width: 100%;
              max-height: 100%;
              border-radius: 8px;
              background: #000;
            }
            .video-info {
              color: white;
              text-align: center;
              margin-top: 10px;
            }
            .close-btn {
              position: absolute;
              top: 10px;
              right: 10px;
              background: rgba(255,255,255,0.2);
              border: none;
              color: white;
              padding: 8px 12px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              z-index: 10;
            }
            .close-btn:hover {
              background: rgba(255,255,255,0.3);
            }
            .loading {
              color: white;
              text-align: center;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <button class="close-btn" onclick="window.close()">Close</button>
          <div class="video-container">
            <video id="videoPlayer" controls preload="metadata" style="width: 100%; height: auto;">
              <source src="${videoUrl}" type="${file.type || 'video/mp4'}">
              <source src="${videoUrl}" type="video/quicktime">
              <source src="${videoUrl}" type="video/x-msvideo">
              <source src="${videoUrl}" type="video/webm">
              Your browser does not support the video tag.
            </video>
            <div class="video-info">
              <h3>${file.name}</h3>
              <p>Size: ${formatFileSize(file.size || file.fileSize || 0)}</p>
            </div>
            <div class="loading" id="loading">Loading video...</div>
          </div>
          
          <script>
            const video = document.getElementById('videoPlayer');
            const loading = document.getElementById('loading');
            
            console.log('Video element:', video);
            console.log('Video src:', video.src);
            console.log('Video sources:', video.querySelectorAll('source'));
            
            video.addEventListener('loadstart', function() {
              console.log('Video load started');
              loading.innerHTML = 'Loading video...';
            });
            
            video.addEventListener('loadedmetadata', function() {
              loading.style.display = 'none';
              console.log('Video loaded successfully, duration:', video.duration);
            });
            
            video.addEventListener('error', function(e) {
              console.error('Video error:', e);
              console.error('Video error details:', video.error);
              loading.innerHTML = 'Error loading video. Check console for details.';
            });
            
            video.addEventListener('canplay', function() {
              loading.style.display = 'none';
              console.log('Video can start playing');
            });
            
            video.addEventListener('loadeddata', function() {
              console.log('Video data loaded');
            });
            
            // Try to play the video after a short delay
            setTimeout(function() {
              video.play().then(function() {
                console.log('Video started playing');
                loading.style.display = 'none';
              }).catch(function(error) {
                console.log('Autoplay prevented:', error);
                loading.innerHTML = 'Click play to start video';
              });
            }, 500);
          </script>
        </body>
        </html>
      `);
      popup.document.close();
      
      // Clean up the URL when popup is closed
      popup.addEventListener('beforeunload', () => {
        URL.revokeObjectURL(videoUrl);
      });
    } else {
      alert('Popup blocked! Please allow popups for this site to view videos.');
    }
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
          const isVideo = file.type?.startsWith('video/') || /\.(mp4|mov|avi|webm|mkv)$/i.test(file.name);
          
          if (!isVideo) return null;
          
          return (
            <div
              key={file.id || index}
              className="flex items-center gap-1.5 p-1.5 bg-gray-50/80 rounded-md border border-gray-200/50 hover:bg-gray-100/80 transition-colors cursor-pointer group"
              onClick={() => openVideoInPopup(file)}
            >
              {/* Play Button */}
              <div className="flex items-center justify-center w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors flex-shrink-0">
                <PlayIcon className="w-2.5 h-2.5 ml-0.5" />
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
