import React from 'react';
import Message from './Message';
import LoadingIndicator from './LoadingIndicator';

const MessageList = ({ messages, isLoading, messagesEndRef, formatTime }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <Message 
          key={message.id} 
          message={message} 
          formatTime={formatTime} 
        />
      ))}

      {/* Loading indicator */}
      {isLoading && <LoadingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
