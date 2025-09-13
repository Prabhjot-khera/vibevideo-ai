import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon, DownloadIcon, TrashIcon } from 'lucide-react';

// Simple audio player component for gallery files
const SimpleAudioPlayer = ({ file, isPlaying, onPlay, onPause }) => {
  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const [audioElementReady, setAudioElementReady] = useState(false);

  useEffect(() => {
    if (file) {
      console.log('🎵 [SimpleAudioPlayer] Creating URL for file:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        isFile: file instanceof File,
        isBlob: file instanceof Blob,
        constructor: file.constructor.name,
        hasId: !!file.id,
        hasUploadTime: !!file.uploadTime
      });
      
      // Reset audio element ready state when file changes
      setAudioElementReady(false);
      
      try {
        // Create object URL from the file
        const url = URL.createObjectURL(file);
        console.log('🎵 [SimpleAudioPlayer] Created audio URL:', url);
        setAudioUrl(url);
        
        return () => {
          console.log('🎵 [SimpleAudioPlayer] Revoking audio URL:', url);
          URL.revokeObjectURL(url);
          setAudioElementReady(false);
        };
      } catch (error) {
        console.error('🎵 [SimpleAudioPlayer] Error creating audio URL:', error);
        setError('Failed to create audio URL: ' + error.message);
      }
    }
  }, [file]);

  // Effect to handle play/pause when isPlaying changes
  useEffect(() => {
    console.log('🎵 [SimpleAudioPlayer] isPlaying effect triggered:', {
      isPlaying,
      hasAudioRef: !!audioRef.current,
      audioSrc: audioRef.current?.src
    });
    
    if (audioRef.current) {
      console.log('🎵 [SimpleAudioPlayer] Play/pause effect triggered:', {
        isPlaying,
        audioSrc: audioRef.current.src,
        readyState: audioRef.current.readyState,
        duration: audioRef.current.duration,
        paused: audioRef.current.paused,
        currentTime: audioRef.current.currentTime,
        networkState: audioRef.current.networkState
      });
      
      if (isPlaying) {
        console.log('🎵 [SimpleAudioPlayer] Attempting to play audio...');
        
        // Add a small delay to ensure audio is fully loaded
        setTimeout(() => {
          if (audioRef.current) {
            console.log('🎵 [SimpleAudioPlayer] About to call play() on audio element');
            console.log('🎵 [SimpleAudioPlayer] Audio element state before play:', {
              readyState: audioRef.current.readyState,
              paused: audioRef.current.paused,
              duration: audioRef.current.duration,
              src: audioRef.current.src,
              networkState: audioRef.current.networkState,
              error: audioRef.current.error
            });
            
            // Check if audio is ready to play
            if (audioRef.current.readyState >= 3) { // HAVE_FUTURE_DATA or higher
              console.log('🎵 [SimpleAudioPlayer] Audio is ready, calling play()');
              audioRef.current.play()
                .then(() => {
                  console.log('🎵 [SimpleAudioPlayer] ✅ Audio play started successfully');
                  console.log('🎵 [SimpleAudioPlayer] Audio state after play:', {
                    paused: audioRef.current.paused,
                    currentTime: audioRef.current.currentTime,
                    duration: audioRef.current.duration,
                    readyState: audioRef.current.readyState
                  });
                })
                .catch(error => {
                  console.error('🎵 [SimpleAudioPlayer] ❌ Audio play failed:', error);
                  console.error('🎵 [SimpleAudioPlayer] Error details:', {
                    error: error.message,
                    name: error.name,
                    code: error.code,
                    stack: error.stack
                  });
                });
            } else {
              console.log('🎵 [SimpleAudioPlayer] Audio not ready yet, readyState:', audioRef.current.readyState);
              // Wait for the audio to be ready
              const handleCanPlay = () => {
                console.log('🎵 [SimpleAudioPlayer] Audio is now ready, attempting to play');
                audioRef.current.removeEventListener('canplay', handleCanPlay);
                audioRef.current.play()
                  .then(() => {
                    console.log('🎵 [SimpleAudioPlayer] ✅ Audio play started successfully (after canplay)');
                    console.log('🎵 [SimpleAudioPlayer] Audio state after play:', {
                      paused: audioRef.current.paused,
                      currentTime: audioRef.current.currentTime,
                      duration: audioRef.current.duration,
                      readyState: audioRef.current.readyState
                    });
                  })
                  .catch(error => {
                    console.error('🎵 [SimpleAudioPlayer] ❌ Audio play failed (after canplay):', error);
                    console.error('🎵 [SimpleAudioPlayer] Error details:', {
                      error: error.message,
                      name: error.name,
                      code: error.code,
                      stack: error.stack
                    });
                  });
              };
              audioRef.current.addEventListener('canplay', handleCanPlay);
            }
          }
        }, 100);
      } else {
        console.log('🎵 [SimpleAudioPlayer] Pausing audio...');
        if (audioRef.current) {
          audioRef.current.pause();
          console.log('🎵 [SimpleAudioPlayer] Audio paused');
        }
      }
    } else {
      console.log('🎵 [SimpleAudioPlayer] Audio ref not ready yet, will retry when audio element is created');
    }
  }, [isPlaying]);

  // Effect to handle play when audio element becomes available
  useEffect(() => {
    if (audioElementReady && audioRef.current && isPlaying) {
      console.log('🎵 [SimpleAudioPlayer] Audio element became available, attempting to play');
      console.log('🎵 [SimpleAudioPlayer] Audio element state:', {
        readyState: audioRef.current.readyState,
        paused: audioRef.current.paused,
        duration: audioRef.current.duration,
        src: audioRef.current.src
      });
      
      // Try to play immediately if ready
      if (audioRef.current.readyState >= 3) {
        console.log('🎵 [SimpleAudioPlayer] Audio is ready, calling play() immediately');
        audioRef.current.play()
          .then(() => {
            console.log('🎵 [SimpleAudioPlayer] ✅ Audio play started successfully (immediate)');
          })
          .catch(error => {
            console.error('🎵 [SimpleAudioPlayer] ❌ Audio play failed (immediate):', error);
          });
      } else {
        console.log('🎵 [SimpleAudioPlayer] Audio not ready yet, waiting for canplay event');
        const handleCanPlay = () => {
          console.log('🎵 [SimpleAudioPlayer] Audio is now ready (canplay), attempting to play');
          audioRef.current.removeEventListener('canplay', handleCanPlay);
          audioRef.current.play()
            .then(() => {
              console.log('🎵 [SimpleAudioPlayer] ✅ Audio play started successfully (canplay)');
            })
            .catch(error => {
              console.error('🎵 [SimpleAudioPlayer] ❌ Audio play failed (canplay):', error);
            });
        };
        audioRef.current.addEventListener('canplay', handleCanPlay);
      }
    }
  }, [audioElementReady, isPlaying]);

  if (!file || !audioUrl) {
    console.log('🎵 [SimpleAudioPlayer] Not rendering:', { file: !!file, audioUrl: !!audioUrl });
    return null;
  }

  console.log('🎵 [SimpleAudioPlayer] Rendering audio element:', {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    audioUrl,
    isPlaying
  });

  return (
    <audio
      ref={(ref) => {
        audioRef.current = ref;
        if (ref) {
          console.log('🎵 [SimpleAudioPlayer] Audio element mounted, setting ready state');
          setAudioElementReady(true);
        }
      }}
      src={audioUrl}
      preload="metadata"
      onEnded={() => onPause()}
      onError={(e) => {
        console.error('🎵 [SimpleAudioPlayer] ❌ Audio element error:', e);
        console.error('🎵 [SimpleAudioPlayer] Error details:', {
          error: e.target.error,
          errorCode: e.target.error?.code,
          errorMessage: e.target.error?.message,
          networkState: e.target.networkState,
          readyState: e.target.readyState,
          src: e.target.src
        });
      }}
      onLoadStart={() => console.log('🎵 [SimpleAudioPlayer] Audio load started')}
      onLoadedData={() => {
        console.log('🎵 [SimpleAudioPlayer] Audio data loaded');
        console.log('🎵 [SimpleAudioPlayer] Loaded data state:', {
          duration: audioRef.current.duration,
          readyState: audioRef.current.readyState,
          networkState: audioRef.current.networkState,
          src: audioRef.current.src
        });
      }}
      onCanPlay={() => {
        console.log('🎵 [SimpleAudioPlayer] Audio can play');
        console.log('🎵 [SimpleAudioPlayer] Can play state:', {
          duration: audioRef.current.duration,
          readyState: audioRef.current.readyState,
          paused: audioRef.current.paused
        });
      }}
      onLoadedMetadata={() => {
        console.log('🎵 [SimpleAudioPlayer] Audio metadata loaded');
        console.log('🎵 [SimpleAudioPlayer] Metadata state:', {
          duration: audioRef.current.duration,
          readyState: audioRef.current.readyState,
          src: audioRef.current.src
        });
      }}
    />
  );
};

const AudioGallery = ({ audioFiles, onPlay, onPause, onDownload, onRemove, isPlaying, currentPlayingId }) => {
  console.log('🎵 AudioGallery received files:', audioFiles);
  console.log('🎵 AudioGallery file details:', audioFiles.map(f => ({
    id: f.id,
    name: f.name,
    type: f.type,
    size: f.size,
    isFile: f instanceof File,
    isBlob: f instanceof Blob
  })));
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

  if (audioFiles.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-gray-300/50 shadow-lg">
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">🎵</div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Processed Audio</h3>
          <p className="text-xs">No processed audio files yet</p>
        </div>
      </div>
    );
  }

  // Get the currently playing file
  const currentPlayingFile = audioFiles.find(file => file.id === currentPlayingId);
  
  console.log('🎵 AudioGallery render state:', {
    audioFilesCount: audioFiles.length,
    currentPlayingId,
    currentPlayingFile: currentPlayingFile ? {
      id: currentPlayingFile.id,
      name: currentPlayingFile.name,
      type: currentPlayingFile.type,
      isFile: currentPlayingFile instanceof File,
      isBlob: currentPlayingFile instanceof Blob
    } : null,
    isPlaying
  });

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-gray-300/50 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-800 flex items-center gap-2">
          🎵 Processed Audio
          <span className="text-xs text-gray-500">({audioFiles.length})</span>
        </h3>
      </div>
      
      {/* Hidden audio player for the currently playing file */}
      {currentPlayingFile && (
        <div>
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>
            Debug: Playing file - {currentPlayingFile.name} (Type: {currentPlayingFile.type})
          </div>
          <SimpleAudioPlayer 
            file={currentPlayingFile} 
            isPlaying={isPlaying} 
            onPlay={onPlay} 
            onPause={onPause} 
          />
        </div>
      )}
      
      <div className="space-y-1 max-h-20 overflow-y-auto">
        {audioFiles.map((file, index) => {
          console.log('🎵 Processing file:', {
            file,
            name: file.name,
            type: file.type,
            originalName: file.originalName,
            id: file.id
          });
          
          const isCurrentlyPlaying = currentPlayingId === file.id;
          const isAudio = file.type?.startsWith('audio/') || /\.(mp3|wav|m4a|ogg|aac)$/i.test(file.name || file.originalName);
          
          console.log('🎵 Audio check result:', {
            isAudio,
            type: file.type,
            name: file.name,
            originalName: file.originalName,
            typeCheck: file.type?.startsWith('audio/'),
            nameCheck: /\.(mp3|wav|m4a|ogg|aac)$/i.test(file.name || file.originalName)
          });
          
          if (!isAudio) {
            console.log('🎵 Skipping non-audio file');
            return null;
          }
          
          console.log('🎵 Rendering audio file item');
          
          return (
            <div
              key={file.id || index}
              className="flex items-center gap-1.5 p-1.5 bg-gray-50/80 rounded-md border border-gray-200/50 hover:bg-gray-100/80 transition-colors cursor-pointer group"
              onClick={() => {
                console.log('🎵 [AudioGallery] Play/pause clicked:', {
                  fileName: file.name,
                  fileType: file.type,
                  fileSize: file.size,
                  fileId: file.id,
                  isCurrentlyPlaying,
                  currentPlayingId,
                  isFile: file instanceof File,
                  isBlob: file instanceof Blob,
                  hasUploadTime: !!file.uploadTime,
                  hasOriginalName: !!file.originalName
                });
                if (isCurrentlyPlaying) {
                  console.log('🎵 [AudioGallery] Calling onPause');
                  onPause();
                } else {
                  console.log('🎵 [AudioGallery] Calling onPlay with file:', file);
                  onPlay(file);
                }
              }}
            >
              {/* Play/Pause Button */}
              <div className="flex items-center justify-center w-5 h-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors flex-shrink-0">
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
                    className="text-xs font-medium text-gray-800 truncate group-hover:text-blue-700 transition-colors hover:underline text-left"
                    title={`Download ${file.name || 'file'}`}
                  >
                    {file.name || file.originalName || 'Unknown file'}
                  </button>
                  {isCurrentlyPlaying && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded-full">
                      Playing
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {formatFileSize(file.size || file.fileSize || 0)} • {file.type || file.mimeType || 'audio/*'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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

export default AudioGallery;
