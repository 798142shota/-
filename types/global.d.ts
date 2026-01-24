export {};

declare global {
  interface Window {
    // The environment already declares aistudio as AIStudio.
    // We use the existing AIStudio type and mark it as optional to match external declarations and usage in App.tsx.
    aistudio?: AIStudio;
    webkitAudioContext: typeof AudioContext;
  }
}
