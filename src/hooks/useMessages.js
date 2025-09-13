import { useState, useRef, useEffect } from 'react';

const useMessages = (initialMessages = null) => {
  const defaultMessages = [
    {
      id: 1,
      type: 'assistant',
      content: "Hi! I'm your AI video editor assistant . Upload a video or audio file and tell me what you'd like me to do with it. I can help you with speed adjustments, cutting, converting to grayscale, combining clips, and enhancing audio quality. I'll provide intelligent suggestions and detailed guidance for your video editing needs.",
      timestamp: new Date()
    }
  ];
  
  const [messages, setMessages] = useState(initialMessages || defaultMessages);
  
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content, type = 'user', additionalData = {}) => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date(),
      ...additionalData // Include processedFile and processedFileName if provided
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const resetMessages = () => {
    setMessages([{
      id: 1,
      type: 'assistant',
      content: "Hi! I'm your AI video editor assistant . Upload a video or audio file and tell me what you'd like me to do with it. I can help you with speed adjustments, cutting, converting to grayscale, combining clips, and enhancing audio quality. I'll provide intelligent suggestions and detailed guidance for your video editing needs.",
      timestamp: new Date()
    }]);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    messagesEndRef,
    addMessage,
    resetMessages,
    formatTime
  };
};

export default useMessages;
