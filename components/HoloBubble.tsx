
import React from 'react';
import { Message, AppMode } from '../types';
import { FlashCard } from './FlashCard';
import { CHARACTERS } from '../constants';

interface HoloBubbleProps {
  message: Message;
  isLatest: boolean;
}

export const HoloBubble: React.FC<HoloBubbleProps> = ({ message, isLatest }) => {
  const isModel = message.role === 'model';
  const charInfo = message.mode && message.mode !== AppMode.INITIAL ? CHARACTERS[message.mode] : null;

  const renderContent = () => {
    const text = message.text;
    if (!text.includes('【フラッシュカード】')) {
      return <p className="text-[14px] md:text-base leading-relaxed text-white whitespace-pre-wrap font-medium drop-shadow-sm">{text}</p>;
    }

    const parts = text.split('【フラッシュカード】');
    const header = parts[0];
    const rest = parts[1] || "";
    const cardRegex = /[①②③]\s*表：(.*?)\s*裏：(.*?)(?=[①②③]|$|【)/gs;
    const cards = [];
    let match;
    while ((match = cardRegex.exec(rest)) !== null) {
      cards.push({ front: match[1].trim(), back: match[2].trim() });
    }
    const remainingText = rest.replace(cardRegex, '').trim();

    return (
      <div className="space-y-4">
        {header && <p className="text-sm text-white/90">{header.trim()}</p>}
        <div className="grid grid-cols-1 gap-4">
          {cards.map((card, idx) => (
            <FlashCard key={idx} front={card.front} back={card.back} />
          ))}
        </div>
        {remainingText && <p className="text-xs text-white/70 whitespace-pre-wrap">{remainingText}</p>}
      </div>
    );
  };

  return (
    <div className={`
      flex flex-col transition-all duration-1000
      ${isLatest ? 'translate-x-0 opacity-100' : 'translate-x-[-20px] opacity-30'}
      ${isModel ? 'items-start' : 'items-end'}
      w-full mb-10
    `}>
      {/* Dynamic Name Tag */}
      <div className={`mb-2 flex items-center gap-3 ${isModel ? 'ml-3' : 'mr-3 opacity-60'}`}>
        {isModel && <div className={`w-2 h-2 rounded-full ${charInfo?.color || 'bg-cyan-400'} shadow-[0_0_8px_currentColor]`} />}
        <span className="text-[11px] uppercase tracking-[0.3em] text-white font-bold opacity-60">
          {isModel ? (charInfo?.name || 'SYSTEM') : 'KID'}
        </span>
      </div>

      <div className={`
        glass p-5 rounded-3xl relative max-w-full md:max-w-[100%] shadow-[0_20px_50px_rgba(0,0,0,0.5)]
        backdrop-blur-xl border border-white/5
        ${isModel 
          ? 'rounded-tl-none bg-gradient-to-br from-white/[0.08] to-transparent text-left' 
          : 'rounded-tr-none bg-gradient-to-bl from-cyan-500/[0.1] to-transparent text-right'}
      `}>
        {/* Holographic scanned lines overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%),linear-gradient(90deg,rgba(255,255,255,0.05),rgba(0,0,0,0),rgba(255,255,255,0.05))] bg-[length:100%_4px,4px_100%] rounded-3xl" />
        
        {renderContent()}
        
        {isLatest && isModel && (
          <div className="absolute -top-1 -left-1">
             <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
          </div>
        )}
      </div>
    </div>
  );
};
