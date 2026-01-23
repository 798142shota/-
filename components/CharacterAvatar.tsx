
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

  // サイズ定義
  const containerSize = {
    sm: isInitial ? 'w-48 h-24' : 'w-20 h-20',
    md: isInitial ? 'w-80 h-40' : 'w-48 h-48',
    lg: isInitial ? 'w-[600px] h-[300px]' : 'w-96 h-96'
  }[size];

  // 画像の切り出し位置 (0:左かんがろう, 50:中おもこ, 100:右やるきち)
  const bgPos = {
    [AppMode.REFLECT]: '0% 50%',
    [AppMode.TRAINING]: '50% 50%',
    [AppMode.IDEA]: '100% 50%',
    [AppMode.INITIAL]: 'center center'
  }[mode];

  const themeColor = isInitial ? '#ffffff' : 
    mode === AppMode.REFLECT ? '#3b82f6' : 
    mode === AppMode.TRAINING ? '#ec4899' : '#f97316';

  return (
    <div className={`relative transition-all duration-1000 ease-in-out ${className} flex items-center justify-center`}>
      {/* 1. キャラクターのオーラ（背景光） */}
      <div 
        className="absolute rounded-full opacity-10 blur-[100px] animate-pulse transition-all duration-1000"
        style={{ 
          backgroundColor: themeColor, 
          width: '120%', 
          height: '100%',
          transform: 'scale(1.5)'
        }}
      />
      
      {/* 2. キャラクター本体 */}
      <div 
        className={`${containerSize} transition-all duration-700 ease-in-out relative z-10`}
        style={{
          backgroundImage: `url(${RABBIT_IMAGE_URL})`,
          // 全員表示のときはそのまま、1匹のときは3倍に拡大して位置を合わせる
          backgroundSize: isInitial ? 'contain' : '300% auto',
          backgroundPosition: bgPos,
          backgroundRepeat: 'no-repeat',
          // 画像の形に沿った影（これがないとただの四角い画像に見えます）
          filter: `drop-shadow(0 15px 30px rgba(0,0,0,0.6)) drop-shadow(0 0 10px ${themeColor}33)`
        }}
      >
        {/* ホログラム風の走査線エフェクト */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(transparent_50%,black_50%)] bg-[length:100%_4px]" />
      </div>

      {/* 3. 足元の設置感（反射光） */}
      <div className="absolute -bottom-8 w-full flex justify-center pointer-events-none">
        <div 
          className="blur-2xl opacity-40 transition-all duration-1000"
          style={{ 
            backgroundColor: themeColor, 
            width: isInitial ? '80%' : '40%', 
            height: '24px',
            borderRadius: '50%'
          }} 
        />
      </div>
    </div>
  );
};
