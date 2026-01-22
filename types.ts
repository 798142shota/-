
export enum AppMode {
  INITIAL = 'INITIAL',
  REFLECT = 'REFLECT',
  TRAINING = 'TRAINING',
  IDEA = 'IDEA'
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  mode?: AppMode;
}

export interface CharacterInfo {
  name: string;
  mode: AppMode;
  bgPos: string;
  color: string;
  description: string;
}
