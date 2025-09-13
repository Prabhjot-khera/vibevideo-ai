import React, { useState, useRef, useEffect } from "react";
import { PlayIcon, PauseIcon, Volume2Icon, VolumeXIcon } from "lucide-react";

const AudioPlayer = ({ file = null, className = "" }) => {
  const [src, setSrc] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const audioRef = useRef(null);
  const progressRef = useRef(null);


  // Validate audio file format
  const isValidAudioFormat = (file) => {
    if (typeof file === "string") {
      // For URLs, check file extension
      const audioExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.aac', '.flac', '.webm'];
      return audioExtensions.some(ext => file.toLowerCase().includes(ext));
    } else if (file instanceof Blob || file instanceof File) {
      // For Blob/File, check MIME type
      const audioMimeTypes = [
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
        'audio/mp4', 'audio/m4a', 'audio/aac', 'audio/ogg',
        'audio/flac', 'audio/webm', 'audio/x-m4a'
      ];
      return audioMimeTypes.some(type => file.type?.toLowerCase().includes(type));
    }
    return false;
  };

  // Build a stable src only when `file` changes
  useEffect(() => {
    let revokeUrl = null;


    if (!file) {
      setSrc(null);
      setIsLoading(false);
      setError(null);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      return;
    }

    // Validate file format
    const isValid = isValidAudioFormat(file);

    if (!isValid) {
      setError(`Unsupported audio format. File type: ${file.type || 'unknown'}, Name: ${file.name || 'unknown'}`);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    if (typeof file === "string") {
      // Remote or local URL string
      setSrc(file);
    } else {
      // File/Blob - ensure correct MIME type
      let processedFile = file;
      
      // Normalize MIME types for better browser compatibility
      if (file.type) {
        if (file.type === 'audio/x-m4a' || file.type === 'audio/m4a') {
          processedFile = new Blob([file], { type: 'audio/mp4' });
        } else if (file.type === 'audio/wave') {
          processedFile = new Blob([file], { type: 'audio/wav' });
        }
      } else if (file instanceof Blob) {
        // If no MIME type, try to guess from filename
        const name = file.name || 'audio';
        if (name.toLowerCase().endsWith('.m4a')) {
          processedFile = new Blob([file], { type: 'audio/mp4' });
        } else if (name.toLowerCase().endsWith('.mp3')) {
          processedFile = new Blob([file], { type: 'audio/mpeg' });
        } else if (name.toLowerCase().endsWith('.wav')) {
          processedFile = new Blob([file], { type: 'audio/wav' });
        }
      }
      
      const url = URL.createObjectURL(processedFile);
      revokeUrl = url;
      setSrc(url);
    }

    return () => {
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [file]);

  // Ensure the audio element reloads when src changes (Safari needs this)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;


    // reset some state on src change
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    if (src) {
      audio.src = src;
      audio.load();
    } else {
      audio.removeAttribute("src");
    }
  }, [src]);

  // Keep element volume/mute in sync with state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const onLoadedMetadata = () => {
    const audio = audioRef.current;
    setDuration(isFinite(audio.duration) ? audio.duration : 0);
    setIsLoading(false);
    setError(null);
  };

  const onTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime || 0);
  };

  const onEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const onError = (e) => {
    console.error('Audio loading error:', e);
    const audio = audioRef.current;
    if (audio) {
      console.error('Audio error details:', {
        error: audio.error,
        networkState: audio.networkState,
        readyState: audio.readyState,
        src: audio.src,
        fileType: file?.type,
        fileName: file?.name
      });
      
      // Try to provide more specific error messages
      if (audio.error) {
        switch (audio.error.code) {
          case 1: // MEDIA_ERR_ABORTED
            setError("Audio loading was aborted. Please try again.");
            break;
          case 2: // MEDIA_ERR_NETWORK
            setError("Network error while loading audio. Please check your connection.");
            break;
          case 3: // MEDIA_ERR_DECODE
            setError("Audio file format is not supported or corrupted. Supported formats: MP3, WAV, M4A, OGG, AAC");
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            setError("Audio format not supported. Please try MP3, WAV, M4A, OGG, or AAC format.");
            break;
          default:
            setError("Failed to load audio file. Please check the file format and try again.");
        }
      } else {
        setError("Failed to load audio file. Please check the file format and try again.");
      }
    } else {
      setError("Failed to load audio file. Please check the file format and try again.");
    }
    setIsLoading(false);
  };

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // Autoplay policy: play() returns a promise
        await audio.play();
        setIsPlaying(true);
      }
    } catch (e) {
      setError("Playback blocked. Tap the play button to start.");
      setIsPlaying(false);
    }
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;

    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.min(Math.max(clickX / rect.width, 0), 1);
    const newTime = pct * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => setIsMuted((m) => !m);

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (v > 0 && isMuted) setIsMuted(false);
  };

  const formatTime = (t) => {
    if (!isFinite(t) || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // --------- UI ---------
  if (!file) {
    return (
      <div className={`p-3 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <p className="text-gray-600 text-sm">No audio selected.</p>
      </div>
    );
  }

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
          <p className="text-gray-600 text-sm">Loading audio…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${className}`}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onError={onError}
      />

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlayPause}
          className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
        >
          {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Progress */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-gray-600 w-8">{formatTime(currentTime)}</span>

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

          <span className="text-xs text-gray-600 w-8">{formatTime(duration)}</span>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="p-1 hover:bg-gray-200 rounded transition-colors">
            {isMuted ? <VolumeXIcon className="w-4 h-4 text-gray-600" /> : <Volume2Icon className="w-4 h-4 text-gray-600" />}
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
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, #d1d5db ${(isMuted ? 0 : volume) * 100}%, #d1d5db 100%)`,
            }}
          />
        </div>
      </div>

      {/* File Info */}
      <div className="mt-2 text-xs text-gray-500">
        {typeof file !== "string" && file?.type && (
          <span className="truncate block">📄 {file.name ?? file.type}</span>
        )}
        {typeof file === "string" && <span className="truncate block">🔗 {file}</span>}
      </div>
    </div>
  );
};

export default AudioPlayer;