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

  // コンテナのサイズ設定 (画像のアスペクト比に合わせる)
  const containerSize = {
    sm: isInitial ? 'w-24 h-14' : 'w-16 h-16',
    md: isInitial ? 'w-48 h-28' : 'w-32 h-32',
    lg: isInitial ? 'w-[320px] h-[180px] md:w-[600px] md:h-[340px]' : 'w-64 h-64 md:w-96 h-96'
  }[size];

  // 画像の切り抜き位置 (提供された画像は左から グレー、白、茶色)
  // 300%の幅にして、left(0%), center(50%), right(100%) で指定
  const bgPos = {
    [AppMode.REFLECT]: '0% center',   // かんがろう（グレー）
    [AppMode.TRAINING]: '50% center',  // おもこ（白）
    [AppMode.IDEA]: '100% center',    // やるきち（茶色）
    [AppMode.INITIAL]: 'center center' // 全員
  }[mode];

  const themeColor = isInitial ? '#ffffff' : 
    mode === AppMode.REFLECT ? '#3b82f6' : 
    mode === AppMode.TRAINING ? '#ec4899' : '#f97316';

  return (
    <div className={`relative transition-all duration-1000 ease-in-out ${className} flex items-center justify-center`}>
      {/* 後光演出：画像の周りに光を漏らす */}
      <div 
        className="absolute rounded-full opacity-20 blur-[50px] animate-pulse transition-all duration-1000"
        style={{ 
          backgroundColor: themeColor, 
          width: '120%', 
          height: '100%',
          transform: 'scale(1.1)'
        }}
      />
      
      {/* キャラクター画像本体 */}
      <div 
        className={`${containerSize} transition-all duration-700 ease-in-out relative z-10`}
        style={{
          backgroundImage: `url(${RABBIT_IMAGE_URL})`,
          // 全員表示の時は contain、個別の時は 300% に引き伸ばして該当箇所を出す
          backgroundSize: isInitial ? 'contain' : '300% auto',
          backgroundPosition: bgPos,
          backgroundRepeat: 'no-repeat',
          filter: `drop-shadow(0 15px 40px rgba(0,0,0,0.6))`,
          backgroundColor: 'transparent',
          display: 'block'
        }}
      >
        {/* ホログラム的な質感を加えるオーバーレイ */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.1)_2px,transparent_2px)] bg-[length:100%_4px]" />
      </div>

      {/* 足元の影 */}
      <div className="absolute -bottom-4 w-full flex justify-center opacity-30">
        <div 
          className="blur-xl transition-all duration-1000"
          style={{ 
            backgroundColor: themeColor, 
            width: isInitial ? '80%' : '40%', 
            height: '12px',
            borderRadius: '50%'
          }} 
        />
      </div>
    </div>
  );
};