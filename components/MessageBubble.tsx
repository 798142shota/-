
import React from 'react';
import { Message, AppMode } from '../types';
import { CharacterAvatar } from './CharacterAvatar';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isModel = message.role === 'model';
  
  return (
    <div className={`flex w-full mb-4 ${isModel ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
        {isModel && message.mode && (
          <div className="mr-2 mt-1">
            <CharacterAvatar mode={message.mode} size="sm" />
          </div>
        )}
        <div 
          className={`
            p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap
            ${isModel 
              ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100' 
              : 'bg-blue-500 text-white rounded-tr-none'}
          `}
        >
          {message.text}
        </div>
      </div>
    </div>
  );
};
