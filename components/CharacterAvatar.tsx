
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

  // 初期は3匹並んでいるので横長、モード中は1匹なので正方形
  const sizeStyles = {
    sm: isInitial ? 'w-32 h-16' : 'w-16 h-16',
    md: isInitial ? 'w-64 h-32' : 'w-40 h-40',
    lg: isInitial ? 'w-[450px] h-[225px]' : 'w-80 h-80'
  }[size];

  // 画像内の位置指定 (左:かんがろう, 中:おもこ, 右:やるきち)
  const bgPos = {
    [AppMode.REFLECT]: '0% center',   // 左
    [AppMode.TRAINING]: '50% center',  // 中央
    [AppMode.IDEA]: '100% center',    // 右
    [AppMode.INITIAL]: 'center center' // 全員
  }[mode];

  const themeColor = isInitial ? '#ffffff' : 
    mode === AppMode.REFLECT ? '#3b82f6' : 
    mode === AppMode.TRAINING ? '#ec4899' : '#f97316';

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
          // 画像が透明な場合、影が形に沿って出るように drop-shadow を使用
          filter: `drop-shadow(0 10px 30px rgba(0,0,0,0.8))`
        }}
      >
        {/* ホログラム風の走査線 */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px]" />
      </div>

      {/* 3. 足元の光（反射） */}
      <div className="absolute -bottom-10 w-full flex justify-center pointer-events-none">
        <div 
          className="blur-2xl opacity-40 transition-all duration-1000"
          style={{ 
            backgroundColor: themeColor, 
            width: isInitial ? '80%' : '50%', 
            height: '20px',
            borderRadius: '50%'
          }} 
        />
      </div>
    </div>
  );
};
