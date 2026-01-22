
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

  // 画面中央に大きく配置するため、サイズをさらに調整
  const sizeStyles = {
    sm: isInitial ? 'w-24 h-12' : 'w-20 h-20',
    md: isInitial ? 'w-48 h-24' : 'w-40 h-40',
    lg: isInitial ? 'w-80 h-40' : 'w-80 h-80'
  }[size];

  const bgPos = {
    [AppMode.REFLECT]: '0% center',   // かんがろう (左)
    [AppMode.TRAINING]: '50% center',  // おもこ (中)
    [AppMode.IDEA]: '100% center',    // やるきち (右)
    [AppMode.INITIAL]: 'center center' // 全員
  }[mode];

  const themeColor = isInitial ? '#ffffff' : 
    mode === AppMode.REFLECT ? '#3b82f6' : 
    mode === AppMode.TRAINING ? '#ec4899' : '#f97316';

  return (
    <div className={`relative transition-all duration-1000 ${className}`}>
      {/* 1. Base Ambient Glow */}
      <div 
        className="absolute inset-0 rounded-full opacity-20 blur-[60px] animate-pulse transition-all duration-1000"
        style={{ backgroundColor: themeColor, transform: isInitial ? 'scale(1.4, 1.0)' : 'scale(1.8)' }}
      />
      
      {/* 2. Character Image */}
      <div 
        className={`${sizeStyles} transition-all duration-1000 border-2 border-white/5 shadow-[0_0_80px_rgba(255,255,255,0.05)] overflow-hidden bg-white/[0.02] relative z-10 ${isInitial ? 'rounded-[3rem]' : 'rounded-full'}`}
        style={{
          backgroundImage: `url(${RABBIT_IMAGE_URL})`,
          backgroundSize: isInitial ? 'contain' : '300% 100%',
          backgroundPosition: bgPos,
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Holographic scanning effect */}
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%),linear-gradient(90deg,rgba(255,0,0,0.08),rgba(0,255,0,0.03),rgba(0,0,255,0.08))] bg-[length:100%_4px,4px_100%]" />
        
        {/* Subtle inner flare */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent opacity-50" />
      </div>
      
      {/* 3. Outer Rim Light */}
      <div className={`absolute inset-0 transition-all duration-1000 border-4 opacity-10 pointer-events-none z-20 ${isInitial ? 'rounded-[3rem]' : 'rounded-full'}`} 
           style={{ borderColor: themeColor }} />
    </div>
  );
};
