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

① かんがろう（ふりかえり・比較）
② おもこ（特訓・キーワード）
③ やるきち（視点・アイデア）`;

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
      if (detected && mode === AppMode.INITIAL) {
        setMode(detected);
        const char = CHARACTERS[detected];
        const msg = `「${char.name}」だよ！任せてね✨\n${char.description}\n今日はどんなことを勉強してるのかな？具体的に教えてくれたら、面白い提案をドンドンするよ！`;
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
      setMessages(prev => [...prev, { role: 'model', text: '通信がうまくいかなかったみたい...もう一度送ってね！', mode: AppMode.INITIAL }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateVeoVideo = async () => {
    if (isVideoLoading) return;
    setIsVideoLoading(true);
    setVideoUrl(null);

    try {
      if (!window.aistudio?.hasSelectedApiKey()) {
        await window.aistudio?.openSelectKey();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      
      // 画像をBase64に変換（固定URLの画像を使用）
      const imgResp = await fetch(RABBIT_IMAGE_URL);
      const blob = await imgResp.blob();
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      const base64Data = await base64Promise;
      const cleanBase64 = base64Data.split(',')[1];

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: 'Cute animated rabbits playing in a social studies classroom, bright colors, 3D style, friendly atmosphere.',
        image: {
          imageBytes: cleanBase64,
          mimeType: 'image/png'
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoBlob = await videoResponse.blob();
        setVideoUrl(URL.createObjectURL(videoBlob));
      }
    } catch (error) {
      console.error("Veo Error:", error);
      alert("動画の生成中にエラーが起きました。APIキーを確認してください。");
    } finally {
      setIsVideoLoading(false);
    }
  };

  const themeColor = mode === AppMode.INITIAL ? '#7dd3fc' : mode === AppMode.REFLECT ? '#60a5fa' : mode === AppMode.TRAINING ? '#f472b6' : '#fb923c';

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden font-sans bg-sky-50">
      <header className="z-50 p-6 flex justify-between items-center bg-white/50 backdrop-blur-md border-b-2 border-white">
        <div className="flex items-center gap-4 bg-white px-6 py-2 rounded-full shadow-lg border-2 border-blue-100">
          <div className="w-4 h-4 rounded-full animate-bounce" style={{ backgroundColor: themeColor }} />
          <h1 className="text-lg font-bold text-slate-700">
            {mode === AppMode.INITIAL ? 'うさぎ三兄弟' : CHARACTERS[mode].name}
          </h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={generateVeoVideo}
            disabled={isVideoLoading}
            className="bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg hover:bg-purple-600 transition-all flex items-center gap-2"
          >
            {isVideoLoading ? '生成中...' : '🎬 動画にする'}
          </button>
          {mode !== AppMode.INITIAL && (
            <button 
              onClick={() => { setMode(AppMode.INITIAL); setMessages([{role: 'model', text: initialGreeting, mode: AppMode.INITIAL}]); }}
              className="bg-white text-slate-500 text-xs font-bold px-6 py-2 rounded-full shadow-md border-2 border-slate-100"
            >
              ← もどる
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 relative flex flex-col md:flex-row">
        {/* 左側：キャラクター */}
        <div className="md:w-1/2 flex items-center justify-center p-8 transition-all duration-1000">
           <div className={`floating transform ${mode === AppMode.INITIAL ? 'scale-100' : 'scale-110'}`}>
              <CharacterAvatar mode={mode} size="lg" />
              {videoUrl && (
                <div className="mt-8 rounded-2xl overflow-hidden shadow-2xl border-4 border-white w-full max-w-sm">
                  <video src={videoUrl} controls autoPlay loop className="w-full" />
                </div>
              )}
           </div>
        </div>

        {/* 右側：チャット */}
        <main className="md:w-1/2 relative flex-1 z-20 overflow-y-auto px-6 pt-4 pb-40 scrollbar-hide">
          <div className="max-w-md mx-auto space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`
                  max-w-[90%] p-5 rounded-3xl shadow-lg border-4 transition-all
                  ${msg.role === 'user' 
                    ? 'bg-blue-400 border-white text-white rounded-tr-none' 
                    : 'bg-white border-white text-slate-700 rounded-tl-none'}
                `}>
                  <p className="font-bold whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  {msg.role === 'model' && (
                    <button 
                      onClick={() => speakText(msg.text)} 
                      className="mt-2 text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-500 hover:bg-slate-200"
                    >
                      🔊 読み上げる
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} className="h-10" />
          </div>
        </main>
      </div>

      <footer className="z-50 p-6 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sky-50 to-transparent">
        <div className="max-w-3xl mx-auto flex gap-3 bg-white p-3 rounded-[3rem] shadow-2xl border-4 border-white">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="社会科のことで教えてほしいことや、考えたことを書いてね！"
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none h-12 md:h-16 text-slate-700 py-3 px-4 font-bold"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: themeColor, color: 'white' }}
          >
            {isLoading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : '送信'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;