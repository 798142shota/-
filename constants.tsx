
import { AppMode, CharacterInfo } from './types';

// 画像URL
export const RABBIT_IMAGE_URL = 'https://lh3.googleusercontent.com/d/1YnrVO3bpxHzSOY0iSsG7I_dUF2YeV1_C';
export const KANGAROO_IMAGE_URL = 'https://lh3.googleusercontent.com/d/1RkPQIHeBDLvU8qc8_m-FjWf4fEsZJ-Q3';
export const OMOKO_IMAGE_URL = 'https://lh3.googleusercontent.com/d/1VUknfVnSuYzl4sSEVFmGJ6wIjFKlu5ch';
export const YARUKICHI_IMAGE_URL = 'https://lh3.googleusercontent.com/d/1CcACxKrrL1z93qgccOPPs4DUhLI0SFOg';

export const CHARACTERS: Record<string, CharacterInfo> = {
  [AppMode.IDEA]: {
    name: 'かんがろう',
    mode: AppMode.IDEA,
    bgPos: 'center',
    color: 'bg-blue-500',
    description: '社会科の「見方・考え方」を使って、多角的な視点から問いかけるよ。'
  },
  [AppMode.TRAINING]: {
    name: 'おもこ',
    mode: AppMode.TRAINING,
    bgPos: 'center',
    color: 'bg-pink-500',
    description: '大事な用語をフラッシュカードでしっかり身につけよう！'
  },
  [AppMode.REFLECT]: {
    name: 'やるきち',
    mode: AppMode.REFLECT,
    bgPos: 'center',
    color: 'bg-orange-500',
    description: 'これまでの学習をふりかえって、次につなげる学習方法をアドバイスするよ。'
  }
};
