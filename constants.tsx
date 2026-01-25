
import { AppMode, CharacterInfo } from './types';

// Google Driveの画像（ID: 1YnrVO3bpxHzSOY0iSsG7I_dUF2YeV1_C）を直接表示するためのURL
export const RABBIT_IMAGE_URL = 'https://lh3.googleusercontent.com/d/1YnrVO3bpxHzSOY0iSsG7I_dUF2YeV1_C';

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
