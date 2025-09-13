import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { 
  Sidebar, 
  MessageList, 
  QuickActions, 
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

  // Check for existing user session on app load
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      setUser(userData.username);
    }
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log('App state changed:', { showLogin, user, showSignup });
  }, [showLogin, user, showSignup]);

  
  const {
    messages,
    isLoading,
    messagesEndRef,
    addMessage,
    resetMessages,
    formatTime,
    setIsLoading
  } = useMessages();

  const conversations = [
    { title: 'Video Speed Adjustment', preview: 'Speed up my video by 2x' },
    { title: 'Audio Enhancement', preview: 'Remove background noise' },
    { title: 'Video Cutting', preview: 'Cut from 0:30 to 2:15' }
  ];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      const userMessage = inputMessage.trim();
      addMessage(userMessage, 'user');
      setInputMessage('');
      setIsLoading(true);
      
      try {
        if (currentFile) {
          // If there's a file, process it with the message
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
              } else if (response.processedFile.type?.startsWith('video/') || /\.(mp4|mov|avi|webm|mkv)$/i.test(processedFileName)) {
                setVideoFiles(prev => [...prev, fileWithId]);
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

  const handleNewChat = () => {
    resetMessages();
    setCurrentFile(null);
  };

  // Gallery handlers
  const handlePlay = (file) => {
    setCurrentPlayingId(file.id);
    setIsPlaying(true);
    setCurrentFile(file);
  };

  const handlePause = () => {
    setIsPlaying(false);
    setCurrentPlayingId(null);
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

  const handleLogin = (username) => {
    setUser(username);
    setShowLogin(false);
    setShowSignup(false);
    // In the future, we'll save user data and load their history here
    console.log('User logged in:', username);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  const handleToggleSignup = () => {
    setShowSignup(!showSignup);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    resetMessages();
    setCurrentFile(null);
  };

  const handleFileSelect = async (file) => {
    setCurrentFile(file);
    addMessage(`File uploaded: ${file.name}`, 'assistant');
    
    // Generate suggestions based on the uploaded file
    setTimeout(async () => {
      try {
        const suggestions = [
          'Speed up the video',
          'Cut specific segments', 
          'Convert to grayscale',
          'Enhance audio quality',
          'Remove background noise',
          'Combine with other clips'
        ];
        addMessage(`Here are some things I can help you do with "${file.name}":\n\n• ${suggestions.join('\n• ')}`, 'assistant');
      } catch (error) {
        console.error('❌ Error generating suggestions:', error);
      }
    }, 1000);
  };

  const handleActionClick = async (actionId) => {
    const actionMessages = {
      'transcript': 'transcript',
      'speed-up': 'Speed up video by 2x',
      'cut-video': 'Cut video from 0:30 to 2:15',
      'grayscale': 'Convert to grayscale',
      'enhance-audio': 'Remove background noise'
    };
    
    const actionMessage = actionMessages[actionId];
    addMessage(actionMessage, 'user');
    
    // Process the action with API
    setIsLoading(true);
    try {
      console.log('⚡ Processing action:', actionMessage);
      
      if (currentFile) {
        // If there's a file, process it with the action
        const response = await VideoApiService.processFile(currentFile, actionMessage);
        
        if (response.success) {
          if (response.processedFile) {
            const processedFileName = `processed_${currentFile.name}`;
            addMessage(`✅ ${actionMessage} completed! Your processed file is ready.`, 'assistant', {
              processedFile: response.processedFile,
              processedFileName: processedFileName
            });
            console.log('Processed file:', response.processedFile);
            
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
            
            console.log('Created fileWithId (action):', {
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
            } else if (response.processedFile.type?.startsWith('video/') || /\.(mp4|mov|avi|webm|mkv)$/i.test(processedFileName)) {
              setVideoFiles(prev => [...prev, fileWithId]);
            }
          } else {
            // API returned success but no file - might be a server issue
            addMessage(`⚠️ ${actionMessage} was received, but the server couldn't process the file. This might be a temporary issue. Please try again or contact support if the problem persists.`, 'assistant');
            console.log('API response without file:', response);
          }
        } else {
          addMessage(`❌ Error processing file: ${response.error}`, 'assistant');
        }
      } else {
        // If no file, just send the message
        const response = await VideoApiService.sendMessage(actionMessage);
        
        if (response.success) {
          const aiResponse = response.data?.message || response.data?.response || `I'll help you ${actionMessage.toLowerCase()}. Please upload a file to process.`;
          addMessage(aiResponse, 'assistant');
        } else {
          addMessage(`❌ Error: ${response.error}`, 'assistant');
        }
      }
    } catch (error) {
      console.error('❌ Error processing action:', error);
      addMessage("I'm sorry, I encountered an error processing your request. Please try again.", 'assistant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen overflow-hidden">
      <div className="relative z-10 flex h-screen w-full">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewChat={handleNewChat}
          conversations={conversations}
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


          {/* Toggle Button for Sections */}
          <div className="border-t border-gray-300 bg-gray-200/70 p-2 flex justify-center">
            <button
              onClick={() => setShowSections(!showSections)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title={showSections ? 'Hide Actions & Galleries' : 'Show Actions & Galleries'}
            >
              <span className="font-medium">
                {showSections ? 'Hide Actions & Galleries' : 'Show Actions & Galleries'}
              </span>
              {showSections ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronUpIcon className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Quick Actions and Galleries - conditionally rendered */}
          {showSections && (
            <>
              <div className="border-t border-gray-300 bg-gray-200/70 p-4">
                <QuickActions onActionClick={handleActionClick} />
              </div>

              {/* File Galleries */}
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
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onDownload={handleDownload}
                    onRemove={handleRemove}
                    onPreview={handlePreview}
                    isPlaying={isPlaying}
                    currentPlayingId={currentPlayingId}
                  />
                </div>
              </div>
            </>
          )}

          <MessageInput
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onFileSelect={handleFileSelect}
            currentFile={currentFile}
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
