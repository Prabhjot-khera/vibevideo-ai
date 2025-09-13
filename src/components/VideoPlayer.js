import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon, Volume2Icon, VolumeXIcon, MaximizeIcon } from 'lucide-react';

const VideoPlayer = ({ file, className = "" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const videoRef = useRef(null);
  const progressRef = useRef(null);

  // Create video URL from file
  const videoUrl = file ? URL.createObjectURL(file) : null;
  
  // Debug logging
  console.log('VideoPlayer rendered with:', {
    file: file ? { name: file.name, type: file.type, size: file.size } : null,
    videoUrl: videoUrl ? 'URL created' : 'No URL',
    isLoading,
    error
  });

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      const video = videoRef.current;
      
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        setIsLoading(false);
        setError(null);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      const handleError = () => {
        setError('Failed to load video file');
        setIsLoading(false);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('error', handleError);
      };
    }
  }, [videoUrl]);

  // Cleanup video URL when component unmounts
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e) => {
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const newTime = (clickX / width) * duration;
      
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className={`p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-red-600 text-sm">⚠️ {error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`p-3 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-sm">Loading video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Video element */}
      <div className="relative">
        <video
          ref={videoRef}
          src={videoUrl}
          preload="metadata"
          className="w-full h-48 object-cover"
          onClick={togglePlayPause}
        />
        
        {/* Play overlay */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer"
            onClick={togglePlayPause}
          >
            <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
              <PlayIcon className="w-8 h-8 text-gray-800 ml-1" />
            </div>
          </div>
        )}
      </div>
      
      {/* Video Controls */}
      <div className="p-3">
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
          >
            {isPlaying ? (
              <PauseIcon className="w-4 h-4" />
            ) : (
              <PlayIcon className="w-4 h-4 ml-0.5" />
            )}
          </button>

          {/* Progress Bar */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs text-gray-600 w-8">
              {formatTime(currentTime)}
            </span>
            
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="flex-1 h-2 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400 transition-colors"
            >
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-100"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            
            <span className="text-xs text-gray-600 w-8">
              {formatTime(duration)}
            </span>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isMuted ? (
                <VolumeXIcon className="w-4 h-4 text-gray-600" />
              ) : (
                <Volume2Icon className="w-4 h-4 text-gray-600" />
              )}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, #d1d5db ${(isMuted ? 0 : volume) * 100}%, #d1d5db 100%)`
              }}
            />
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <MaximizeIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* File Info */}
        <div className="mt-2 text-xs text-gray-500">
          {file?.name && (
            <span className="truncate block">
              🎬 {file.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
