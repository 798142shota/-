
import React, { useState } from 'react';

interface FlashCardProps {
  front: string;
  back: string;
}

export const FlashCard: React.FC<FlashCardProps> = ({ front, back }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div 
      className="group w-full h-40 [perspective:1000px] cursor-pointer my-4"
      onClick={() => setFlipped(!flipped)}
    >
      <div className={`relative h-full w-full rounded-2xl transition-all duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
        {/* Front */}
        <div className="absolute inset-0 flex flex-col items-center justify-center glass rounded-2xl [backface-visibility:hidden] p-4 text-center border-2 border-cyan-400/30">
          <span className="text-xs uppercase tracking-widest text-cyan-400 mb-2 font-bold">Front: Keyword</span>
          <p className="text-lg font-bold text-white">{front}</p>
          <p className="text-[10px] text-white/40 mt-4">タップして答えを見る</p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 h-full w-full rounded-2xl bg-cyan-900/80 p-4 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden] border-2 border-cyan-400">
          <span className="text-xs uppercase tracking-widest text-cyan-300 mb-2 font-bold">Back: Point</span>
          <p className="text-sm text-white font-medium">{back}</p>
        </div>
      </div>
    </div>
  );
};
