import React, { useState } from 'react';

interface FlashCardProps { front: string; back: string; }

export const FlashCard: React.FC<FlashCardProps> = ({ front, back }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="w-full h-36 [perspective:1000px] cursor-pointer my-2" onClick={() => setFlipped(!flipped)}>
      <div className={`relative h-full w-full rounded-3xl transition-all duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
        {/* Front */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-50 rounded-3xl [backface-visibility:hidden] p-4 text-center border-4 border-yellow-200 shadow-sm">
          <span className="text-[10px] font-black uppercase text-yellow-500 mb-1">これ、なーんだ？</span>
          <p className="text-base font-black text-slate-700">{front}</p>
        </div>
        {/* Back */}
        <div className="absolute inset-0 h-full w-full rounded-3xl bg-orange-400 p-4 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden] border-4 border-white shadow-inner">
          <span className="text-[10px] font-black uppercase text-white/80 mb-1">こたえ！</span>
          <p className="text-sm text-white font-black">{back}</p>
        </div>
      </div>
    </div>
  );
};