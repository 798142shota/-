
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

  // 初期は3匹並んでいるので横長、モード中は1匹なので正方形に近いサイズ
  const sizeStyles = {
    sm: isInitial ? 'w-32 h-16' : 'w-16 h-16',
    md: isInitial ? 'w-64 h-32' : 'w-40 h-40',
    lg: isInitial ? 'w-[450px] h-[225px]' : 'w-80 h-80'
  }[size];

  // 画像内の位置指定 (左:かんがろう, 中:おもこ, 右:やるきち)
  const bgPos = {
    [AppMode.REFLECT]: '0% center',   // かんがろう (左)
    [AppMode.TRAINING]: '50% center',  // おもこ (中)
    [AppMode.IDEA]: '100% center',    // やるきち (右)
    [AppMode.INITIAL]: 'center center' // 全員
  }[mode];

  const themeColor = isInitial ? '#ffffff' : 
    mode === AppMode.REFLECT ? '#4a90e2' : 
    mode === AppMode.TRAINING ? '#f06292' : '#ff9800';

  return (
    <div className={`relative transition-all duration-1000 ease-out ${className} flex items-center justify-center`}>
      {/* 1. 背後のオーラ */}
      <div 
        className="absolute rounded-full opacity-20 blur-[80px] animate-pulse transition-all duration-1000"
        style={{ 
          backgroundColor: themeColor, 
          width: isInitial ? '120%' : '140%', 
          height: '100%',
          transform: 'scale(1.2)'
        }}
      />
      
      {/* 2. キャラクター本体 */}
      <div 
        className={`${sizeStyles} transition-all duration-700 ease-in-out relative z-10`}
        style={{
          backgroundImage: `url(${RABBIT_IMAGE_URL})`,
          backgroundSize: isInitial ? 'contain' : '300% 100%',
          backgroundPosition: bgPos,
          backgroundRepeat: 'no-repeat',
          filter: `drop-shadow(0 10px 20px rgba(0,0,0,0.5)) drop-shadow(0 0 5px ${themeColor}44)`
        }}
      >
        {/* ホログラム風の走査線（うっすら） */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px]" />
      </div>

      {/* 3. 足元の影と反射 */}
      <div className="absolute -bottom-4 w-full flex justify-center pointer-events-none">
        <div 
          className="blur-xl opacity-30 transition-all duration-1000"
          style={{ 
            backgroundColor: themeColor, 
            width: isInitial ? '80%' : '40%', 
            height: '20px',
            borderRadius: '50%'
          }} 
        />
      </div>
    </div>
  );
};
