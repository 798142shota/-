
import React from 'react';
import { 
  RABBIT_IMAGE_URL, 
  KANGAROO_IMAGE_URL, 
  OMOKO_IMAGE_URL, 
  YARUKICHI_IMAGE_URL 
} from '../constants';
import { AppMode } from '../types';

interface CharacterAvatarProps {
  mode: AppMode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ mode, size = 'md', className = '' }) => {
  const isInitial = mode === AppMode.INITIAL;

  // コンテナサイズ設定（全画面でゆったり表示されるように大きめに設定）
  const containerSize = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: isInitial ? 'w-[320px] h-[240px] md:w-[600px] md:h-[450px]' : 'w-72 h-72 md:w-[480px] md:h-[480px]'
  }[size];

  const getImageUrl = () => {
    switch (mode) {
      case AppMode.IDEA: return KANGAROO_IMAGE_URL;
      case AppMode.TRAINING: return OMOKO_IMAGE_URL;
      case AppMode.REFLECT: return YARUKICHI_IMAGE_URL;
      default: return RABBIT_IMAGE_URL;
    }
  };

  const auraColor = isInitial ? '#fbbf24' : 
    mode === AppMode.IDEA ? '#60a5fa' : 
    mode === AppMode.TRAINING ? '#f472b6' : '#fb923c';

  return (
    <div className={`relative transition-all duration-700 ease-in-out ${className} flex items-center justify-center`}>
      {/* 背後のオーラ（画像が浮き上がって見えるように調整） */}
      <div 
        className="absolute rounded-full opacity-40 blur-[50px] md:blur-[80px] animate-pulse transition-all duration-1000"
        style={{ 
          backgroundColor: auraColor, 
          width: '90%', 
          height: isInitial ? '70%' : '90%',
          transform: 'scale(1.1)'
        }}
      />
      
      {/* 画像コンテナ */}
      <div className={`${containerSize} relative z-10 flex items-center justify-center overflow-hidden`}>
        <img 
          src={getImageUrl()} 
          alt="サポーター"
          crossOrigin="anonymous"
          className="w-full h-full select-none pointer-events-none transition-all duration-500"
          style={{ 
            // 'contain' にすることで画像が枠内で一切切れずに全表示されます
            objectFit: 'contain',
          }}
          loading="eager"
        />
      </div>

      {/* 影の装飾 */}
      {!isInitial && (
        <div className="absolute -bottom-4 w-full flex justify-center opacity-10">
          <div 
            className="blur-2xl transition-all duration-1000"
            style={{ 
              backgroundColor: '#000', 
              width: '50%', 
              height: '15px',
              borderRadius: '50%'
            }} 
          />
        </div>
      )}
    </div>
  );
};
