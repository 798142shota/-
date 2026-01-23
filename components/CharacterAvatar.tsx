
import React from 'react';
import { RABBIT_IMAGE_URL } from '../constants';
import { AppMode } from '../types';

interface CharacterAvatarProps {
  mode: AppMode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ mode, size = 'md', className = '' }) => {
  const isInitial = mode === AppMode.INITIAL;

  const containerSize = {
    sm: isInitial ? 'w-48 h-24' : 'w-20 h-20',
    md: isInitial ? 'w-80 h-40' : 'w-48 h-48',
    lg: isInitial ? 'w-[400px] h-[200px] md:w-[600px] md:h-[300px]' : 'w-64 h-64 md:w-96 h-96'
  }[size];

  // 0% (左:かんがろう), 50% (中:おもこ), 100% (右:やるきち)
  const bgPos = {
    [AppMode.REFLECT]: '0% center',
    [AppMode.TRAINING]: '50% center',
    [AppMode.IDEA]: '100% center',
    [AppMode.INITIAL]: 'center center'
  }[mode];

  const themeColor = isInitial ? '#ffffff' : 
    mode === AppMode.REFLECT ? '#3b82f6' : 
    mode === AppMode.TRAINING ? '#ec4899' : '#f97316';

  return (
    <div className={`relative transition-all duration-1000 ease-in-out ${className} flex items-center justify-center`}>
      {/* 1. キャラクターの背景光 */}
      <div 
        className="absolute rounded-full opacity-20 blur-[60px] animate-pulse transition-all duration-1000"
        style={{ 
          backgroundColor: themeColor, 
          width: '100%', 
          height: '100%',
          transform: 'scale(1.2)'
        }}
      />
      
      {/* 2. キャラクター本体（四角く見えないように設定） */}
      <div 
        className={`${containerSize} transition-all duration-700 ease-in-out relative z-10`}
        style={{
          backgroundImage: `url(${RABBIT_IMAGE_URL})`,
          backgroundSize: isInitial ? 'contain' : '300% 100%',
          backgroundPosition: bgPos,
          backgroundRepeat: 'no-repeat',
          // 画像が不透明な背景を持っていても、影で形を浮き彫りにする
          filter: `drop-shadow(0 15px 30px rgba(0,0,0,0.5))`,
          backgroundColor: 'transparent' // 背景色を透明に強制
        }}
      >
        {/* ホログラムの縞々模様 */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]" />
      </div>

      {/* 3. 足元の影 */}
      <div className="absolute -bottom-6 w-full flex justify-center opacity-30">
        <div 
          className="blur-xl transition-all duration-1000"
          style={{ 
            backgroundColor: themeColor, 
            width: isInitial ? '80%' : '50%', 
            height: '15px',
            borderRadius: '50%'
          }} 
        />
      </div>
    </div>
  );
};
