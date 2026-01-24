import React, { useState, useEffect, useRef } from 'react';
import { AppMode, Message } from './types';
import { CHARACTERS, RABBIT_IMAGE_URL } from './constants';
import { CharacterAvatar } from './components/CharacterAvatar';
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
    
    // Check if an API key has been selected as required for Veo generation.
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
      // Guidelines state that after calling openSelectKey, we should assume success to avoid race conditions.
    }

    setIsVideoLoading(true);
    setVideoUrl(null);

    try {
      // Create a new GoogleGenAI instance right before making an API call to ensure latest key is used.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Convert the reference image to Base64.
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
        // Polling every 10 seconds as recommended in guidelines.
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        // Must append API key when fetching from the download link.
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoBlob = await videoResponse.blob();
        setVideoUrl(URL.createObjectURL(videoBlob));
      }
    } catch (error: any) {
      console.error("Veo Error:", error);
      // Handle "Requested entity was not found" by prompting for key selection again.
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
    <div className="h-screen w-full flex flex-col relative overflow-hidden font-sans">
      <header className="z-50 p-5 flex justify-between items-center bg-white/70 backdrop-blur-lg border-b-4 border-white">
        <div className="flex items-center gap-4 bg-white px-6 py-2.5 rounded-full shadow-md border-2 border-yellow-100">
          <div className="w-4 h-4 rounded-full animate-bounce" style={{ backgroundColor: themeColor }} />
          <h1 className="text-xl font-black text-slate-700 tracking-tight">
            {mode === AppMode.INITIAL ? 'うさぎ三兄弟' : CHARACTERS[mode].name}
          </h1>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={generateVeoVideo}
            disabled={isVideoLoading}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-black px-6 py-2.5 rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-2 border-2 border-white"
          >
            {isVideoLoading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />つくり中...</>
            ) : (
              '🎬 動画にする！'
            )}
          </button>
          {mode !== AppMode.INITIAL && (
            <button 
              onClick={() => { setMode(AppMode.INITIAL); setMessages([{role: 'model', text: initialGreeting, mode: AppMode.INITIAL}]); setVideoUrl(null); }}
              className="bg-white text-slate-400 text-sm font-bold px-6 py-2.5 rounded-full shadow-md border-2 border-slate-50 hover:bg-slate-50 transition-all"
            >
              ← えらびなおす
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 relative flex flex-col md:flex-row">
        {/* 左：キャラクター表示 */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-8 transition-all duration-1000">
           <div className={`floating transform ${mode === AppMode.INITIAL ? 'scale-100' : 'scale-110 md:scale-125'}`}>
              {!videoUrl ? (
                <CharacterAvatar mode={mode} size="lg" />
              ) : (
                <div className="rounded-[3rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.2)] border-[6px] border-white w-full max-w-lg bg-black">
                  <video src={videoUrl} controls autoPlay loop className="w-full" />
                </div>
              )}
           </div>
           {isVideoLoading && (
             <div className="mt-8 text-center bg-white/80 backdrop-blur px-8 py-4 rounded-3xl border-2 border-purple-200 shadow-xl animate-pulse">
               <p className="text-purple-600 font-black">AIがうさぎたちをアニメにしているよ...<br/>1分くらい待っててね！</p>
             </div>
           )}
        </div>

        {/* 右：チャットエリア */}
        <main className="md:w-1/2 relative flex-1 z-20 overflow-y-auto px-6 pt-6 pb-44 scrollbar-hide">
          <div className="max-w-md mx-auto space-y-8">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`
                  max-w-[92%] p-6 rounded-[2.5rem] shadow-xl border-4 transition-all
                  ${msg.role === 'user' 
                    ? 'bg-blue-400 border-white text-white rounded-tr-none' 
                    : 'bg-white border-white text-slate-700 rounded-tl-none'}
                `}>
                  <p className="font-black text-base md:text-lg whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  {msg.role === 'model' && (
                    <div className="mt-4 flex gap-2">
                      <button 
                        onClick={() => speakText(msg.text)} 
                        className="text-xs bg-slate-100 px-4 py-2 rounded-full font-bold text-slate-500 hover:bg-slate-200 transition-colors flex items-center gap-1"
                      >
                        🔊 読み上げる
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} className="h-10" />
          </div>
        </main>
      </div>

      {/* 入力フォーム */}
      <footer className="z-50 p-6 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/80 to-transparent">
        <div className="max-w-3xl mx-auto flex gap-3 bg-white p-3 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-4 border-white">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="社会科の相談をしてみてね！"
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none h-14 md:h-16 text-slate-700 py-3 px-6 text-lg font-black placeholder-slate-300"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale"
            style={{ backgroundColor: themeColor, color: 'white' }}
          >
            {isLoading ? (
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
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