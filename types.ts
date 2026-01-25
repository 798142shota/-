
export enum AppMode {
  INITIAL = 'INITIAL',
  REFLECT = 'REFLECT',
  TRAINING = 'TRAINING',
  IDEA = 'IDEA'
}

export type ImageSize = '1K' | '2K' | '4K';

export interface Message {
  role: 'user' | 'model';
  text: string;
  mode?: AppMode;
  imageUrl?: string;
}

export interface CharacterInfo {
  name: string;
  mode: AppMode;
  bgPos: string;
  color: string;
  description: string;
}
