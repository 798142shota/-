
import { AppMode, CharacterInfo } from './types';

export const RABBIT_IMAGE_URL = 'https://r.jina.ai/i/6e19194e9f9040469b736528821908d1';

export const CHARACTERS: Record<string, CharacterInfo> = {
  [AppMode.REFLECT]: {
    name: 'かんがろう',
    mode: AppMode.REFLECT,
    bgPos: 'left',
    color: 'bg-blue-500',
    description: '「学び方」をいっしょにふりかえるよ。'
  },
  [AppMode.TRAINING]: {
    name: 'おもこ',
    mode: AppMode.TRAINING,
    bgPos: 'center',
    color: 'bg-pink-500',
    description: '単元の内容を思い出す「特訓」をしよう！'
  },
  [AppMode.IDEA]: {
    name: 'やるきち',
    mode: AppMode.IDEA,
    bgPos: 'right',
    color: 'bg-orange-500',
    description: 'ちがう角度からアイデアを広げてみるよ。'
  }
};
