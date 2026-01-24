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

  // コンテナのサイズ（提供画像のアスペクト比に合わせる）
  const containerSize = {
    sm: isInitial ? 'w-32 h-18' : 'w-20 h-20',
    md: isInitial ? 'w-48 h-28' : 'w-32 h-32',
    lg: isInitial ? 'w-[320px] h-[180px] md:w-[600px] md:h-[340px]' : 'w-64 h-64 md:w-96 h-96'
  }[size];

  // 画像の切り抜き位置 (左:グレー, 中:白, 右:茶色)
  const bgPos = {
    [AppMode.REFLECT]: '0% 50%',   // 左（かんがろう）
    [AppMode.TRAINING]: '50% 50%',  // 中央（おもこ）
    [AppMode.IDEA]: '100% 50%',    // 右（やるきち）
    [AppMode.INITIAL]: 'center center' // 全員
  }[mode];

  const themeColor = isInitial ? '#fcd34d' : 
    mode === AppMode.REFLECT ? '#60a5fa' : 
    mode === AppMode.TRAINING ? '#f472b6' : '#fb923c';

  return (
    <div className={`relative transition-all duration-700 ease-in-out ${className} flex items-center justify-center`}>
      {/* 柔らかな光の輪 */}
      <div 
        className="absolute rounded-full opacity-30 blur-[60px] animate-pulse transition-all duration-1000"
        style={{ 
          backgroundColor: themeColor, 
          width: isInitial ? '110%' : '90%', 
          height: isInitial ? '60%' : '90%',
          transform: 'scale(1.2)'
        }}
      />
      
      {/* キャラクター画像本体 */}
      <div 
        className={`${containerSize} transition-all duration-500 ease-out relative z-10`}
        style={{
          backgroundImage: `url(${RABBIT_IMAGE_URL})`,
          backgroundSize: isInitial ? 'contain' : '300% 100%',
          backgroundPosition: bgPos,
          backgroundRepeat: 'no-repeat',
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))',
        }}
      />

      {/* ポップな影 */}
      <div className="absolute -bottom-10 w-full flex justify-center opacity-20">
        <div 
          className="blur-xl transition-all duration-1000"
          style={{ 
            backgroundColor: '#000', 
            width: isInitial ? '80%' : '40%', 
            height: '15px',
            borderRadius: '50%'
          }} 
        />
      </div>
    </div>
  );
};