import React, { useState, useEffect, useRef } from 'react';
import { AppMode, Message } from './types';
import { CHARACTERS, RABBIT_IMAGE_URL } from './constants';
import { CharacterAvatar } from './components/CharacterAvatar';
import { HoloBubble } from './components/HoloBubble';
import { generateResponse, speakText } from './geminiService';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.INITIAL);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const initialGreeting = `ヤッホー！ボクたちは社会科サポーター「うさぎ三兄弟」だよ！🐰✨
君の社会科の学びがもっと面白くなるように、ドンドン提案していくね！

どのうさぎと話してみたい？番号か名前で教えてね！

① 【かんがろう】（ふりかえり・比較）
② 【おもこ】（特訓・キーワード）
③ 【やるきち】（視点・アイデア）`;

  useEffect(() => {
    setMessages([{ role: 'model', text: initialGreeting, mode: AppMode.INITIAL }]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const detectMode = (text: string): AppMode | null => {
    const t = text.toLowerCase();
    if (t.includes('1') || t.includes('①') || t.includes('かんがろう')) return AppMode.REFLECT;
    if (t.includes('2') || t.includes('②') || t.includes('おもこ')) return AppMode.TRAINING;
    if (t.includes('3') || t.includes('③') || t.includes('やるきち')) return AppMode.IDEA;
    return null;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const detected = detectMode(userText);
      if (detected && (mode === AppMode.INITIAL || userText.length < 10)) {
        setMode(detected);
        const char = CHARACTERS[detected];
        const msg = `「${char.name}」だよ！任せてね✨\n${char.description}\n今日は社会科のどんなことを調べてるの？面白くなるヒントをドンドン出すよ！`;
        setMessages(prev => [...prev, { role: 'model', text: msg, mode: detected }]);
        speakText(msg);
        setIsLoading(false);
        return;
      }

      const aiResponse = await generateResponse(mode, userText);
      if (aiResponse) {
        setMessages(prev => [...prev, { role: 'model', text: aiResponse, mode: mode }]);
        speakText(aiResponse);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'ちょっと疲れちゃったみたい。もう一度送ってくれる？', mode: AppMode.INITIAL }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateVeoVideo = async () => {
    if (isVideoLoading) return;
    
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
    }

    setIsVideoLoading(true);
    setVideoUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const imgResp = await fetch(RABBIT_IMAGE_URL);
      const blob = await imgResp.blob();
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
      });

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: 'Three cute colorful rabbits (grey, white, brown) in a bright elementary school social studies classroom, moving happily, 3D animated style, very high quality, cheerful atmosphere.',
        image: {
          imageBytes: base64Data,
          mimeType: 'image/png'
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoBlob = await videoResponse.blob();
        setVideoUrl(URL.createObjectURL(videoBlob));
      }
    } catch (error: any) {
      console.error("Veo Error:", error);
      if (error?.message?.includes("Requested entity was not found")) {
        if (window.aistudio) await window.aistudio.openSelectKey();
      }
      alert("ごめんね、動画を作るのに失敗しちゃった。APIキーを確認してみてね！");
    } finally {
      setIsVideoLoading(false);
    }
  };

  const themeColor = mode === AppMode.INITIAL ? '#fbbf24' : mode === AppMode.REFLECT ? '#60a5fa' : mode === AppMode.TRAINING ? '#f472b6' : '#fb923c';

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden font-sans bg-[#fffdf0]">
      {/* ヘッダー：固定 */}
      <header className="z-50 p-4 md:p-5 flex justify-between items-center bg-white/80 backdrop-blur-md border-b-4 border-white shrink-0">
        <div className="flex items-center gap-3 md:gap-4 bg-white px-4 md:px-6 py-2 rounded-full shadow-md border-2 border-yellow-100">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full animate-bounce" style={{ backgroundColor: themeColor }} />
          <h1 className="text-base md:text-xl font-black text-slate-700 tracking-tight">
            {mode === AppMode.INITIAL ? 'うさぎ三兄弟' : CHARACTERS[mode].name}
          </h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={generateVeoVideo}
            disabled={isVideoLoading}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] md:text-sm font-black px-4 md:px-6 py-2 rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-1 border-2 border-white"
          >
            {isVideoLoading ? 'つくり中...' : '🎬 動画化'}
          </button>
          {mode !== AppMode.INITIAL && (
            <button 
              onClick={() => { setMode(AppMode.INITIAL); setMessages([{role: 'model', text: initialGreeting, mode: AppMode.INITIAL}]); setVideoUrl(null); }}
              className="bg-white text-slate-400 text-[10px] md:text-sm font-bold px-4 md:px-6 py-2 rounded-full shadow-sm border-2 border-slate-50"
            >
              もどる
            </button>
          )}
        </div>
      </header>

      {/* メインコンテンツエリア：スクロール可能 */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* キャラクター（デスクトップでは左、モバイルでは上） */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-8 shrink-0">
           <div className={`floating transform transition-all duration-700 ${mode === AppMode.INITIAL ? 'scale-90 md:scale-100' : 'scale-100 md:scale-110'}`}>
              {!videoUrl ? (
                <CharacterAvatar mode={mode} size="lg" />
              ) : (
                <div className="rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-[6px] border-white w-full max-w-sm md:max-w-lg bg-black">
                  <video src={videoUrl} controls autoPlay loop className="w-full" />
                </div>
              )}
           </div>
           {isVideoLoading && (
             <div className="mt-4 text-center bg-white/90 px-6 py-3 rounded-2xl border-2 border-purple-200 shadow-lg animate-pulse">
               <p className="text-purple-600 text-sm font-black">アニメーション作成中...</p>
             </div>
           )}
        </div>

        {/* チャットメッセージ（デスクトップでは右、モバイルでは下） */}
        <main className="w-full md:w-1/2 flex-1 overflow-y-auto px-6 pt-4 pb-32 scrollbar-hide bg-white/20">
          <div className="max-w-md mx-auto space-y-6">
            {messages.map((msg, i) => (
              <HoloBubble key={i} message={msg} isLatest={i === messages.length - 1} />
            ))}
            <div ref={chatEndRef} className="h-4" />
          </div>
        </main>
      </div>

      {/* 入力フォーム：画面下部に固定 */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-gradient-to-t from-[#fffdf0] via-[#fffdf0]/90 to-transparent">
        <div className="max-w-3xl mx-auto flex gap-2 md:gap-3 bg-white p-2 md:p-3 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border-4 border-white ring-8 ring-black/5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="社会科の相談をしてね！"
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none h-12 md:h-16 text-slate-700 py-3 px-4 md:px-6 text-base md:text-xl font-black placeholder-slate-300"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: themeColor, color: 'white' }}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-8 md:h-8">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;