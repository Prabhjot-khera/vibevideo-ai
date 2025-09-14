import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { 
  Sidebar, 
  MessageList, 
  MessageInput, 
  Header,
  ParticleBackground,
  AudioGallery,
  VideoGallery
} from './components';
import Login from './components/login';
import useMessages from './hooks/useMessages';
import VideoApiService from './services/videoApiService';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentFile, setCurrentFile] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState(null);
  const [audioFiles, setAudioFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSections, setShowSections] = useState(true);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentFiles, setCurrentFiles] = useState([]);

  // Check for existing user session on app load
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      setUser(userData.username);
    }
  }, []);

  // Track currentFiles state changes
  useEffect(() => {
    console.log('📁 currentFiles state changed:', {
      currentFiles: currentFiles,
      fileCount: currentFiles?.length || 0,
      fileNames: currentFiles?.map(f => f.name) || []
    });
  }, [currentFiles]);

  // Initialize first chat on app load
  useEffect(() => {
    if (chats.length === 0) {
      const initialChat = {
        id: Date.now(),
        title: 'New Chat',
        preview: 'Start a new conversation...',
        createdAt: new Date(),
        messages: [],
        audioFiles: [],
        videoFiles: []
      };
      setChats([initialChat]);
      setCurrentChatId(initialChat.id);
    }
  }, [chats.length]);

  // Debug state changes
  useEffect(() => {
    console.log('App state changed:', { showLogin, user, showSignup });
  }, [showLogin, user, showSignup]);

  
  // Get current chat messages
  const currentChat = chats.find(chat => chat.id === currentChatId);
  const currentMessages = currentChat?.messages || [];

  const updateCurrentChat = useCallback(async (messages) => {
    if (currentChatId) {
      const updatedChat = {
        messages: messages,
        audioFiles: audioFiles,
        videoFiles: videoFiles,
        title: messages.length > 1 ? messages[1]?.content?.substring(0, 30) + '...' : 'New Chat',
        preview: messages[messages.length - 1]?.content?.substring(0, 50) + '...' || 'Start a new conversation...'
      };
      
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, ...updatedChat }
          : chat
      ));
      
      // Chat data is stored in local component state
      if (user) {
        console.log('Chat updated in local state');
      }
    }
  }, [currentChatId, audioFiles, videoFiles, user]);

  const addFileToCurrentChat = useCallback((file, type) => {
    if (currentChatId) {
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { 
              ...chat, 
              [type === 'audio' ? 'audioFiles' : 'videoFiles']: [...(chat[type === 'audio' ? 'audioFiles' : 'videoFiles'] || []), file]
            }
          : chat
      ));
    }
  }, [currentChatId]);
  
  const {
    messages,
    setMessages,
    isLoading,
    messagesEndRef,
    addMessage,
    resetMessages,
    formatTime,
    setIsLoading
  } = useMessages(currentMessages.length > 0 ? currentMessages : null);

  // Update current chat when messages change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      updateCurrentChat(messages);
    }
  }, [messages, currentChatId, updateCurrentChat]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      const userMessage = inputMessage.trim();
      addMessage(userMessage, 'user');
      setInputMessage('');
      setIsLoading(true);
      
      try {
        // Check if user wants to merge multiple files
        if (currentFiles && currentFiles.length > 1 && userMessage.toLowerCase().includes('merge')) {
          addMessage('Merging files...', 'assistant');
          
          const result = await VideoApiService.processMultipleFiles(currentFiles, 'merge');
          
          if (result.success) {
            // Add the merged file to the appropriate gallery
            const mergedFile = result.processedFile;
            
            // Create a new File object with additional properties
            const fileWithId = new File([mergedFile], mergedFile.name, {
              type: mergedFile.type,
              lastModified: Date.now()
            });
            
            // Add additional properties to the File object
            fileWithId.id = Date.now() + Math.random();
            fileWithId.uploadTime = new Date();
            fileWithId.originalName = mergedFile.name;
            fileWithId.fileSize = mergedFile.size || 0;
            fileWithId.mimeType = mergedFile.type || 'application/octet-stream';
            
            if (mergedFile.type.startsWith('video/')) {
              setVideoFiles(prev => [...prev, fileWithId]);
              addFileToCurrentChat(fileWithId, 'video');
              addMessage(`✅ Video merged successfully! Check the Video Gallery below.`, 'assistant');
            } else if (mergedFile.type.startsWith('audio/')) {
              setAudioFiles(prev => [...prev, fileWithId]);
              addFileToCurrentChat(fileWithId, 'audio');
              addMessage(`✅ Audio merged successfully! Check the Audio Gallery below.`, 'assistant');
            } else {
              // Fallback - add to both galleries
              setVideoFiles(prev => [...prev, fileWithId]);
              setAudioFiles(prev => [...prev, fileWithId]);
              addFileToCurrentChat(fileWithId, 'video');
              addFileToCurrentChat(fileWithId, 'audio');
              addMessage(`✅ Files merged successfully! Check the galleries below.`, 'assistant');
            }
            
            // Clear the current files after merging
            setCurrentFiles([]);
          } else {
            addMessage(`❌ Merge failed: ${result.error}`, 'assistant');
          }
        } else if (currentFile) {
          // If there's a single file, process it with the message
          const response = await VideoApiService.processFile(currentFile, userMessage);
          
          if (response.success) {
            if (response.processedFile) {
              // Add message with processed file for download
              const processedFileName = `processed_${currentFile.name}`;
              addMessage(`✅ File processed successfully! Your request "${userMessage}" has been completed.`, 'assistant', {
                processedFile: response.processedFile,
                processedFileName: processedFileName
              });
              
              // Add processed file to appropriate gallery
              // Create a new File object with additional properties
              const fileWithId = new File([response.processedFile], processedFileName, {
                type: response.processedFile.type || 'application/octet-stream',
                lastModified: Date.now()
              });
              
              // Add additional properties to the File object
              fileWithId.id = Date.now() + Math.random();
              fileWithId.uploadTime = new Date();
              fileWithId.originalName = processedFileName;
              fileWithId.fileSize = response.processedFile.size || 0;
              fileWithId.mimeType = response.processedFile.type || 'application/octet-stream';
              
              console.log('Created fileWithId:', {
                name: fileWithId.name,
                type: fileWithId.type,
                size: fileWithId.size,
                isFile: fileWithId instanceof File,
                isBlob: fileWithId instanceof Blob,
                id: fileWithId.id
              });
              
              // Determine if it's audio or video based on file type or name
              if (response.processedFile.type?.startsWith('audio/') || /\.(mp3|wav|m4a|ogg|aac)$/i.test(processedFileName)) {
                setAudioFiles(prev => [...prev, fileWithId]);
                addFileToCurrentChat(fileWithId, 'audio');
                
                // Audio file stored in local state
                if (user) {
                  console.log('Audio file processed and stored locally');
                }
              } else if (response.processedFile.type?.startsWith('video/') || /\.(mp4|mov|avi|webm|mkv)$/i.test(processedFileName)) {
                setVideoFiles(prev => [...prev, fileWithId]);
                addFileToCurrentChat(fileWithId, 'video');
                
                // Video file stored in local state
                if (user) {
                  console.log('Video file processed and stored locally');
                }
              }
            } else {
              // API returned success but no file - might be a server issue
              addMessage(`⚠️ Your request "${userMessage}" was received, but the server couldn't process the file. This might be a temporary issue. Please try again or contact support if the problem persists.`, 'assistant');
            }
          } else {
            addMessage(`❌ Error processing file: ${response.error}`, 'assistant');
          }
        } else {
          // If no file, just send the message
          const response = await VideoApiService.sendMessage(userMessage);
          
          if (response.success) {
            const aiResponse = response.data?.message || response.data?.response || 'I received your message and processed it successfully!';
            addMessage(aiResponse, 'assistant');
          } else {
            addMessage(`I encountered an error: ${response.error}. Please try again.`, 'assistant');
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
        addMessage("I'm sorry, I encountered an error. Please try again.", 'assistant');
      } finally {
        setIsLoading(false);
      }
    }
  };


  // Gallery handlers
  const handlePlay = (file) => {
    console.log('🎵 [App] handlePlay called with file:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileId: file.id,
      isFile: file instanceof File,
      isBlob: file instanceof Blob,
      hasUploadTime: !!file.uploadTime,
      hasOriginalName: !!file.originalName,
      constructor: file.constructor.name
    });
    setCurrentPlayingId(file.id);
    setIsPlaying(true);
    setCurrentFile(file);
    console.log('🎵 [App] handlePlay state updated:', {
      currentPlayingId: file.id,
      isPlaying: true
    });
  };

  const handlePause = () => {
    console.log('🎵 [App] handlePause called');
    setIsPlaying(false);
    setCurrentPlayingId(null);
    console.log('🎵 [App] handlePause state updated:', {
      isPlaying: false,
      currentPlayingId: null
    });
  };

  const handleDownload = (file) => {
    console.log('📥 Download attempt:', {
      file,
      type: typeof file,
      isBlob: file instanceof Blob,
      isFile: file instanceof File,
      name: file.name || file.originalName,
      size: file.size || file.fileSize,
      mimeType: file.type || file.mimeType
    });
    
    // Test if we can read the file before downloading
    if (file instanceof File || file instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        console.log('📥 File read test for download successful, first 100 bytes:', 
          new Uint8Array(reader.result).slice(0, 100)
        );
      };
      reader.onerror = () => {
        console.error('📥 File read test for download failed');
      };
      reader.readAsArrayBuffer(file.slice(0, 1024)); // Read first 1KB
    }
    
    try {
      // Ensure we have a valid Blob or File object
      let fileToDownload = file;
      
      // If it's not a Blob/File, try to create one
      if (!(file instanceof Blob) && !(file instanceof File)) {
        console.log('⚠️ File is not a Blob/File, attempting to create one');
        
        // If it has data property, use that
        if (file.data) {
          fileToDownload = new Blob([file.data], { type: file.type || file.mimeType || 'application/octet-stream' });
        } else if (file.url) {
          // If it has a URL, fetch it
          fetch(file.url)
            .then(response => response.blob())
            .then(blob => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = file.name || file.originalName || 'download';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            })
            .catch(error => {
              console.error('❌ Download failed:', error);
              alert('Download failed. Please try again.');
            });
          return;
        } else {
          // Last resort: try to create a simple text file with the file info
          console.log('⚠️ Creating fallback text file');
          const textContent = `File: ${file.name || file.originalName || 'Unknown'}\nType: ${file.type || file.mimeType || 'Unknown'}\nSize: ${file.size || file.fileSize || 'Unknown'}`;
          fileToDownload = new Blob([textContent], { type: 'text/plain' });
        }
      }
      
      const url = URL.createObjectURL(fileToDownload);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name || file.originalName || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ Download successful');
    } catch (error) {
      console.error('❌ Download error:', error);
      alert('Download failed. The file may be corrupted or in an unsupported format.');
    }
  };

  const handleRemove = (file) => {
    if (file.type?.startsWith('audio/') || /\.(mp3|wav|m4a|ogg|aac)$/i.test(file.name)) {
      setAudioFiles(prev => prev.filter(f => f.id !== file.id));
    } else if (file.type?.startsWith('video/') || /\.(mp4|mov|avi|webm|mkv)$/i.test(file.name)) {
      setVideoFiles(prev => prev.filter(f => f.id !== file.id));
    }
    
    // If this was the current file, clear it
    if (currentFile && currentFile.id === file.id) {
      setCurrentFile(null);
    }
    
    // If this was playing, stop it
    if (currentPlayingId === file.id) {
      handlePause();
    }
  };

  const handlePreview = (file) => {
    setCurrentFile(file);
    addMessage(`Previewing: ${file.name}`, 'assistant');
  };



  const handleProfileClick = () => {
    console.log('handleProfileClick called! Setting showLogin to true');
    setShowLogin(true);
  };

  // Chat management functions
  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'New Chat',
      preview: 'Start a new conversation...',
      createdAt: new Date(),
      messages: [],
      audioFiles: [],
      videoFiles: []
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    
    // Reset messages for the new chat
    resetMessages();
    
    // Clear current file and galleries
    setCurrentFile(null);
    setAudioFiles([]);
    setVideoFiles([]);
    setCurrentPlayingId(null);
    setIsPlaying(false);
    
    console.log('New chat created:', newChat);
  };

  const handleChatSelect = (chatId) => {
    setCurrentChatId(chatId);
    const selectedChat = chats.find(chat => chat.id === chatId);
    if (selectedChat) {
      // Load messages from the selected chat
      setMessages(selectedChat.messages);
      // Load audio and video files from the selected chat
      setAudioFiles(selectedChat.audioFiles || []);
      setVideoFiles(selectedChat.videoFiles || []);
      // Clear current playing state when switching chats
      setCurrentPlayingId(null);
      setIsPlaying(false);
      setCurrentFile(null);
      console.log('Switched to chat:', selectedChat);
    }
  };

  const handleLogin = (username, userChats = [], userLibrary = []) => {
    setUser(username);
    setShowLogin(false);
    setShowSignup(false);
    
    console.log('User logged in:', username);
    console.log('Loading user data:', { chats: userChats.length, library: userLibrary.length });
    
    // Load user's chats from login data
    if (userChats && userChats.length > 0) {
      const formattedChats = userChats.map(chat => ({
        id: chat._id.toString(),
        title: chat.title,
        preview: chat.messages && chat.messages.length > 0 ? 
          chat.messages[chat.messages.length - 1].text.substring(0, 50) + '...' : 
          'No messages',
        lastMessage: chat.updatedAt ? new Date(chat.updatedAt) : new Date(),
        messages: chat.messages || [],
        audioFiles: [],
        videoFiles: []
      }));
      
      setChats(formattedChats);
      
      // Set the first chat as current if available
      if (formattedChats.length > 0) {
        setCurrentChatId(formattedChats[0].id);
        setMessages(formattedChats[0].messages);
      }
    }
    
    // Load user's library items (audio/video files)
    if (userLibrary && userLibrary.length > 0) {
      const audioFiles = [];
      const videoFiles = [];
      
      userLibrary.forEach(item => {
        // Convert library item to File object for display
        if (item.fileType && item.fileType.startsWith('audio/')) {
          audioFiles.push({
            id: item._id.toString(),
            name: item.fileName || 'Unknown Audio',
            type: item.fileType,
            size: item.fileSize || 0,
            uploadTime: new Date(item.updatedAt),
            originalName: item.fileName,
            fileSize: item.fileSize,
            mimeType: item.fileType
          });
        } else if (item.fileType && item.fileType.startsWith('video/')) {
          videoFiles.push({
            id: item._id.toString(),
            name: item.fileName || 'Unknown Video',
            type: item.fileType,
            size: item.fileSize || 0,
            uploadTime: new Date(item.updatedAt),
            originalName: item.fileName,
            fileSize: item.fileSize,
            mimeType: item.fileType
          });
        }
      });
      
      setAudioFiles(audioFiles);
      setVideoFiles(videoFiles);
    }
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  const handleLogout = () => {
    // Clear user session
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userChats');
    localStorage.removeItem('userLibrary');
    
    // Reset app state
    setChats([]);
    setCurrentChatId(null);
    setMessages([]);
    setAudioFiles([]);
    setVideoFiles([]);
    setCurrentFile(null);
    setCurrentFiles([]);
    
    console.log('User logged out');
  };

  const handleToggleSignup = () => {
    setShowSignup(!showSignup);
  };



  const handleFileSelect = async (file) => {
    setCurrentFile(file);
    setCurrentFiles([]); // Clear multiple files when single file is selected
    addMessage(`File uploaded: ${file.name}`, 'assistant');
  };

  const handleMultipleFileSelect = async (files) => {
    console.log('📁 handleMultipleFileSelect called with files:', {
      fileCount: files.length,
      fileNames: files.map(f => f.name),
      files: files
    });
    
    // Set the files in state
    setCurrentFiles(files);
    setCurrentFile(null); // Clear single file when multiple files are selected
    
    // Log the files we just set (not the state, which might not be updated yet)
    console.log('📁 Files set in state:', {
      files: files,
      fileCount: files.length,
      fileNames: files.map(f => f.name)
    });
    
    addMessage(`${files.length} files uploaded: ${files.map(f => f.name).join(', ')}`, 'assistant');
  };


  return (
    <div className="relative flex h-screen overflow-hidden">
      <div className="relative z-10 flex h-screen w-full">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewChat={handleNewChat}
          conversations={chats}
          onChatSelect={handleChatSelect}
          currentChatId={currentChatId}
          user={user}
          onProfileClick={handleProfileClick}
          onLogout={handleLogout}
        />
        
        <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-100 to-gray-200 relative">
          <ParticleBackground />
          
          <Header
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            currentFile={currentFile}
          />

          <MessageList
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
            formatTime={formatTime}
          />


          {/* Toggle Button for Galleries */}
          <div className="border-t border-gray-300 bg-gray-200/70 p-2 flex justify-center">
            <button
              onClick={() => setShowSections(!showSections)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title={showSections ? 'Hide Galleries' : 'Show Galleries'}
            >
              <span className="font-medium">
                {showSections ? 'Hide Galleries' : 'Show Galleries'}
              </span>
              {showSections ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronUpIcon className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* File Galleries - conditionally rendered */}
          {showSections && (
            <div className="border-t border-gray-300 bg-gray-100/50 p-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AudioGallery
                  audioFiles={audioFiles}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onDownload={handleDownload}
                  onRemove={handleRemove}
                  isPlaying={isPlaying}
                  currentPlayingId={currentPlayingId}
                />
                <VideoGallery
                  videoFiles={videoFiles}
                  onDownload={handleDownload}
                  onRemove={handleRemove}
                  onPreview={handlePreview}
                />
              </div>
            </div>
          )}

          <MessageInput
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onFileSelect={handleFileSelect}
            onMultipleFileSelect={handleMultipleFileSelect}
            currentFile={currentFile}
            currentFiles={currentFiles}
          />
        </div>
      </div>
      
      {/* Login Modal */}
      {showLogin && (
        <Login
          onLogin={handleLogin}
          onClose={handleCloseLogin}
          showSignup={showSignup}
          onToggleSignup={handleToggleSignup}
        />
      )}
    </div>
  );
}

export default App;
