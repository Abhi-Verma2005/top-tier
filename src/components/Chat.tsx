'use client'
import React, { useRef, useEffect, useState } from 'react';
import { Check, Clipboard, User } from 'lucide-react';
import Image from 'next/image';
import gemini from '@/images/zero.png'; 
import useMessageStore from '@/store/messages';
import toast from 'react-hot-toast';
import ProjectSubmissionForm from './Forms/ProjectForm';
import { useParams } from 'next/navigation';
import useTokenStore from '@/store/token';
import ZeroLoader from './ZeroLoader';
import { useSession } from 'next-auth/react';

const ChatComponent: React.FC = () => {
  const { 
    messages, 
    isLoading,
    isFocused,
  } = useMessageStore();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

 
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(id);
      toast.success("Copied to clipboard! 📋");
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy! ❌");
    }
  };


  return (
    <div className="flex mt-24 flex-col w-full h-[90vh] pb-28 max-w-[70%] mx-auto relative">
      <div className="flex-1 p-4 pb-24 overflow-y-auto relative">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-center">Rate with</p>
            <span className='flex items-center justify-center'>
              {isLoading &&  <ZeroLoader isPlaying={false}/>}
              {!isLoading &&  <ZeroLoader/>}
            </span>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`relative max-w-3/4 rounded-lg p-3 ${
                  message.sender === 'user' 
                    ? 'bg-blue-800 text-gray-100 rounded-br-none' 
                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none shadow-md'
                }`}
                style={{ width: message.sender === 'ai' ? '75%' : 'auto' }}
              >
                <div className="flex flex-col w-full">
                  <div className="flex items-center mb-1">
                    {message.sender === 'ai' ? (
                      <Image src={gemini} alt='gemini' className='size-5 rounded-lg'/>
                    ) : (
                      <User size={16} className="mr-1 text-blue-400" />
                    )}
                    <span className="text-xs opacity-70 mx-1">
                      {message.sender === 'ai' ? 'Zero' : 'You'} • {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  <div className="w-full p-3">
                    <div className="whitespace-pre-wrap">{message.text}</div>
                  </div>
    
                  <button 
                    className="absolute bottom-2 right-2 p-1 rounded-md text-gray-400 hover:text-blue-300 transition-all"
                    onClick={() => copyToClipboard(message.text, message.id)}
                  >
                    {copiedMessageId === message.id ? (
                      <Check size={16} className="text-green-400" />
                    ) : (
                      <Clipboard size={16}/>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
        <div className="flex mb-4 justify-start">
          <div className="flex max-w-[75%] rounded-lg p-4 bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none shadow-md">
            <div className="flex items-center space-x-2">
              <Image src={gemini} alt="gemini" className="size-5" />
              <p className="text-xl font-semibold text-transparent bg-clip-text bg-[linear-gradient(to_right,#333_0%,#888_50%,#333_100%)] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite_linear]">
                Zero is Thinking
              </p>
            </div>
          </div>
        </div>
      )}
        
        <div ref={messagesEndRef} />
      </div>
      {isFocused && <ProjectSubmissionForm /> }
    </div>
  );
};

export default ChatComponent;