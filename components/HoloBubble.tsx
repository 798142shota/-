import React from 'react';
import { Message, AppMode } from '../types';
import { FlashCard } from './FlashCard';
import { CHARACTERS } from '../constants';
import { speakText } from '../geminiService';

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
      return <p className={`text-base md:text-lg leading-relaxed whitespace-pre-wrap font-black ${isModel ? 'text-slate-700' : 'text-white'}`}>{text}</p>;
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
        {header && <p className="text-sm font-black text-slate-600">{header.trim()}</p>}
        <div className="grid grid-cols-1 gap-4">
          {cards.map((card, idx) => (
            <FlashCard key={idx} front={card.front} back={card.back} />
          ))}
        </div>
        {remainingText && <p className="text-xs text-slate-400 font-bold whitespace-pre-wrap">{remainingText}</p>}
      </div>
    );
  };

  return (
    <div className={`
      flex flex-col transition-all duration-700
      ${isLatest ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-70'}
      ${isModel ? 'items-start' : 'items-end'}
      w-full mb-4
    `}>
      <div className={`mb-1 flex items-center gap-2 ${isModel ? 'ml-4' : 'mr-4'}`}>
        {isModel && (
          <div className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm" style={{ backgroundColor: charInfo?.color.replace('bg-', '') || '#7dd3fc' }}>
            {charInfo?.name || 'USAKKO'}
          </div>
        )}
      </div>

      <div className={`
        relative p-5 md:p-6 rounded-[2rem] max-w-[95%] shadow-xl border-4
        ${isModel 
          ? 'bg-white border-white rounded-tl-none text-left' 
          : 'bg-blue-400 border-white rounded-tr-none text-right ml-auto'}
      `}>
        {renderContent()}
        
        {isModel && (
          <div className="mt-3 flex justify-start">
            <button 
              onClick={() => speakText(message.text)} 
              className="text-[10px] bg-slate-100 px-4 py-2 rounded-full font-black text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all flex items-center gap-1 shadow-sm border border-slate-200"
            >
              🔊 こえできく
            </button>
          </div>
        )}
        
        {/* 装飾 */}
        {isLatest && isModel && (
          <div className="absolute -bottom-2 -right-2 bg-yellow-400 w-6 h-6 rounded-full border-4 border-white shadow-md animate-bounce" />
        )}
      </div>
    </div>
  );
};