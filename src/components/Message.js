import React, { useMemo } from 'react';
import DownloadButton from './DownloadButton';
import VideoPlayer from './VideoPlayer';

function base64ToBlob(b64, mime = 'application/octet-stream') {
  // Handles both "data:...;base64,XXXX" and raw base64
  const clean = b64.includes(',') ? b64.split(',')[1] : b64;
  const binary = atob(clean);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function guessKindFromTypeOrName(type, name = '') {
  if (type?.startsWith('audio/')) return 'audio';
  if (type?.startsWith('video/')) return 'video';
  const lower = name.toLowerCase();
  if (/\.(mp3|wav|m4a|ogg|aac)$/.test(lower)) return 'audio';
  if (/\.(mp4|mov|webm|mkv)$/.test(lower)) return 'video';
  return null;
}

// Normalize MIME types for better browser compatibility
function normalizeMimeType(type, name = '') {
  if (!type) return type;
  
  // Handle M4A files - convert x-m4a to standard mp4
  if (type === 'audio/x-m4a' || type === 'audio/m4a') {
    return 'audio/mp4';
  }
  
  // Handle WAV files - normalize wave to wav
  if (type === 'audio/wave') {
    return 'audio/wav';
  }
  
  return type;
}

const Message = ({ message, formatTime }) => {
  const isUser = message.type === 'user';

  // --- Normalize processedFile once ---
  const norm = useMemo(() => {
    const pf = message.processedFile;
    if (!pf) return null;

    // Case 1: plain string URL
    if (typeof pf === 'string') {
      return {
        kind: guessKindFromTypeOrName(null, pf) ?? 'audio', // best guess
        fileForPlayer: pf, // pass string URL to players
        type: null,
        name: message.processedFileName || pf.split('/').pop() || 'file',
        asBlobForDownload: null,
      };
    }

    // Case 2: real Blob/File
    if (pf instanceof Blob) {
      const type = pf.type || (message.processedFileMime ?? '');
      const normalizedType = normalizeMimeType(type);
      const name = message.processedFileName || (pf.name ?? 'file');
      
      // Create a new blob with normalized MIME type if needed
      let fixedBlob = pf;
      if (normalizedType !== type) {
        fixedBlob = new Blob([pf], { type: normalizedType });
      } else if (!type) {
        fixedBlob = pf.slice(0, pf.size, 'application/octet-stream');
      }
      
      return {
        kind: guessKindFromTypeOrName(normalizedType, name),
        fileForPlayer: fixedBlob,            // pass Blob/File to players
        type: normalizedType || 'application/octet-stream',
        name,
        asBlobForDownload: fixedBlob,        // DownloadButton can use Blob
      };
    }

    // Case 3: object from API (common patterns)
    // - { url, type?, name? }
    if (pf.url) {
      const type = pf.type || null;
      const name = message.processedFileName || pf.name || 'file';
      return {
        kind: guessKindFromTypeOrName(type, name) ?? 'audio',
        fileForPlayer: pf.url,               // string URL
        type,
        name,
        asBlobForDownload: null,
      };
    }
    // - { base64, type, name? } or { data, contentType }
    const b64 = pf.base64 || pf.data;
    const mime = pf.type || pf.contentType || 'application/octet-stream';
    if (b64) {
      const blob = base64ToBlob(b64, mime);
      const name = message.processedFileName || pf.name || `file.${mime.split('/')[1] || 'bin'}`;
      return {
        kind: guessKindFromTypeOrName(mime, name),
        fileForPlayer: new File([blob], name, { type: mime }), // stable File
        type: mime,
        name,
        asBlobForDownload: blob,
      };
    }

    // Fallback: cannot preview
    return { kind: null, fileForPlayer: null, type: pf.type || null, name: pf.name || 'file', asBlobForDownload: null };
  }, [message.processedFile, message.processedFileName, message.processedFileMime]);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 relative z-30`}>
      <div className={`flex gap-3 max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-cyan-500 glow-blue' 
            : 'bg-gradient-to-br from-gray-700 to-gray-800 glow-gray'
        }`}>
          {isUser ? (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white glow-blue'
              : 'bg-white/95 backdrop-blur-sm border border-gray-300/50 text-gray-800 shadow-lg'
          }`}>
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            
            {/* Processed file controls */}
            {message.processedFile && !isUser && (
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                
                {/* Audio file info - no player, just download */}
                {norm?.kind === 'audio' && norm.fileForPlayer && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">
                      🎵 Audio File{norm.type ? ` (Type: ${norm.type})` : ''}:
                    </p>
                    <p className="text-sm text-gray-600">
                      Your processed audio file is ready! Use the Audio Gallery below to play it.
                    </p>
                  </div>
                )}

                {/* Video player */}
                {norm?.kind === 'video' && norm.fileForPlayer && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">
                      🎬 Video Player{norm.type ? ` (Type: ${norm.type})` : ''}:
                    </p>
                    <VideoPlayer file={norm.fileForPlayer} className="w-full" />
                  </div>
                )}

                {/* Unknown/unsupported preview */}
                {!norm?.kind && (
                  <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-100 rounded">
                    📄 File: {norm?.name || 'file'}{norm?.type ? ` | Type: ${norm.type}` : ''}
                    <br />
                    <span className="text-gray-400">No preview available for this type.</span>
                  </div>
                )}

                {/* Download button for all processed files */}
                <DownloadButton
                  file={norm?.asBlobForDownload || norm?.fileForPlayer} 
                  filename={norm?.name || message.processedFileName || 'download'}
                  className="text-sm"
                />
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500 mt-2 px-2">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Message;
