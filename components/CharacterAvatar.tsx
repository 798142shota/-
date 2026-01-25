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
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: isInitial ? 'w-[320px] h-[180px] md:w-[600px] md:h-[340px]' : 'w-64 h-64 md:w-96 h-96'
  }[size];

  // キャラクターごとのX方向の移動量（%）
  // 画像全体を300%の幅として扱い、左(0%)、中(-100%)、右(-200%)とスライドさせる
  const offsets = {
    [AppMode.REFLECT]: '0%',      // 左：かんがろう
    [AppMode.TRAINING]: '-100%',  // 中：おもこ
    [AppMode.IDEA]: '-200%',      // 右：やるきち
    [AppMode.INITIAL]: '0%'       // 全体表示用
  };

  const auraColor = isInitial ? '#fbbf24' : 
    mode === AppMode.REFLECT ? '#60a5fa' : 
    mode === AppMode.TRAINING ? '#f472b6' : '#fb923c';

  return (
    <div className={`relative transition-all duration-700 ease-in-out ${className} flex items-center justify-center`}>
      {/* 背後のオーラ */}
      <div 
        className="absolute rounded-full opacity-40 blur-[40px] md:blur-[60px] animate-pulse transition-all duration-1000"
        style={{ 
          backgroundColor: auraColor, 
          width: '100%', 
          height: isInitial ? '60%' : '100%',
          transform: 'scale(1.2)'
        }}
      />
      
      {/* 画像コンテナ */}
      <div className={`${containerSize} relative z-10 flex items-center justify-center overflow-hidden rounded-[2rem] md:rounded-[3rem]`}>
        <div 
          className="relative w-full h-full transition-all duration-500 ease-in-out"
          style={{
            // 初期状態は全体を表示、選択後はそのキャラだけを表示
            width: isInitial ? '100%' : '300%', 
            transform: isInitial ? 'none' : `translateX(${offsets[mode]})`
          }}
        >
          <img 
            src={RABBIT_IMAGE_URL} 
            alt="サポーター"
            crossOrigin="anonymous"
            className="absolute top-0 left-0 w-full h-full select-none pointer-events-none"
            style={{ 
              objectFit: isInitial ? 'contain' : 'cover',
            }}
            loading="eager"
          />
        </div>
      </div>

      {/* 影 */}
      {!isInitial && (
        <div className="absolute -bottom-6 w-full flex justify-center opacity-20">
          <div 
            className="blur-xl transition-all duration-1000"
            style={{ 
              backgroundColor: '#000', 
              width: '40%', 
              height: '10px',
              borderRadius: '50%'
            }} 
          />
        </div>
      )}
    </div>
  );
};