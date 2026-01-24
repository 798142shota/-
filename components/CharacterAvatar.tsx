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

  // コンテナのサイズ設定
  const containerSize = {
    sm: isInitial ? 'w-32 h-20' : 'w-20 h-20',
    md: isInitial ? 'w-64 h-36' : 'w-36 h-36',
    lg: isInitial ? 'w-[320px] h-[200px] md:w-[600px] md:h-[360px]' : 'w-64 h-64 md:w-96 h-96'
  }[size];

  // 画像の表示位置制御 (左:かんがろう, 中:おもこ, 右:やるきち)
  // transform: translateX で3匹並んだ画像から1匹分を切り出す
  const translateValue = {
    [AppMode.REFLECT]: '0%',      // 左
    [AppMode.TRAINING]: '-33.33%', // 中央
    [AppMode.IDEA]: '-66.66%',     // 右
    [AppMode.INITIAL]: '0%'        // 全員
  }[mode];

  const themeColor = isInitial ? '#fbbf24' : 
    mode === AppMode.REFLECT ? '#60a5fa' : 
    mode === AppMode.TRAINING ? '#f472b6' : '#fb923c';

  return (
    <div className={`relative transition-all duration-700 ease-in-out ${className} flex items-center justify-center`}>
      {/* 柔らかな背景の光 */}
      <div 
        className="absolute rounded-full opacity-40 blur-[50px] animate-pulse"
        style={{ 
          backgroundColor: themeColor, 
          width: '100%', 
          height: isInitial ? '60%' : '100%',
        }}
      />
      
      {/* キャラクター画像本体 */}
      <div className={`${containerSize} relative z-10 overflow-hidden rounded-3xl flex items-center justify-center`}>
        <div 
          className="h-full transition-transform duration-500 ease-out flex"
          style={{ 
            width: isInitial ? '100%' : '300%',
            transform: isInitial ? 'none' : `translateX(${translateValue})`
          }}
        >
          <img 
            src={RABBIT_IMAGE_URL} 
            alt="うさぎサポーター"
            className="h-full w-full object-contain pointer-events-none select-none"
            style={{ 
              minWidth: isInitial ? '100%' : '33.33%',
            }}
          />
          {!isInitial && (
            <>
              <img src={RABBIT_IMAGE_URL} className="h-full min-width-[33.33%] object-contain opacity-0" />
              <img src={RABBIT_IMAGE_URL} className="h-full min-width-[33.33%] object-contain opacity-0" />
            </>
          )}
        </div>
      </div>

      {/* 影 */}
      <div className="absolute -bottom-8 w-full flex justify-center opacity-30">
        <div 
          className="blur-xl"
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