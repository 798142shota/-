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

  // コンテナのサイズ（比率は画像に合わせる）
  const sizes = {
    sm: isInitial ? 'w-24 h-14' : 'w-16 h-16',
    md: isInitial ? 'w-48 h-28' : 'w-32 h-32',
    lg: isInitial ? 'w-[320px] h-[180px] md:w-[600px] md:h-[340px]' : 'w-64 h-64 md:w-80 h-80'
  };

  const currentSize = sizes[size];

  // 画像のクリッピング（提供画像は左から グレー、白、茶色）
  const clipStyles: React.CSSProperties = isInitial ? {
    objectFit: 'contain',
    width: '100%',
    height: '100%',
  } : {
    objectFit: 'cover',
    width: '300%', // 3倍の幅にして特定の部分だけ見せる
    height: '100%',
    position: 'absolute',
    left: mode === AppMode.REFLECT ? '0%' : mode === AppMode.TRAINING ? '-100%' : '-200%',
    top: 0,
    transition: 'left 0.5s ease-in-out'
  };

  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      {/* 影 */}
      <div className="absolute -bottom-4 w-1/2 h-4 bg-black/10 blur-xl rounded-full" />
      
      <div className={`${currentSize} relative z-10 overflow-hidden rounded-2xl`}>
        <img 
          src={RABBIT_IMAGE_URL} 
          alt="うさぎサポーター"
          style={clipStyles}
          className="select-none pointer-events-none"
        />
      </div>
    </div>
  );
};