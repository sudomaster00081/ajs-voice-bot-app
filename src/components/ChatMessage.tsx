import React from 'react';
import { User, Brain } from 'lucide-react';
import { Message } from '../App';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className={`flex items-start space-x-4 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-3xl ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200 ${
          message.isUser 
            ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white' 
            : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white'
        }`}>
          {message.isUser ? <User className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
        </div>
        
        <div className={`rounded-3xl px-6 py-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${
          message.isUser
            ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-br-lg'
            : 'bg-white/90 text-gray-900 border-2 border-emerald-200/50 rounded-bl-lg'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.text}</p>
          <p className={`text-xs mt-2 ${
            message.isUser ? 'text-teal-100' : 'text-gray-500'
          }`}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}