
import React, { useState, useEffect, useRef } from 'react';
import { AppMode, Message } from './types';
import { CHARACTERS } from './constants';
import { CharacterAvatar } from './components/CharacterAvatar';
import { HoloBubble } from './components/HoloBubble';
import { generateResponse } from './geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.INITIAL);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const initialGreeting = `こんにちは！ボクたちは「うさっこ三兄弟」だよ。
社会科の学びを深めるサポーターなんだ。
使いたいモードを選んでね！

① ふりかえりモード
② 特訓モード
③ アイデアモード`;

  useEffect(() => {
    setMessages([{ role: 'model', text: initialGreeting, mode: AppMode.INITIAL }]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getTemplate = (m: AppMode) => {
    switch (m) {
      case AppMode.REFLECT:
        return "今日の学習方法：\nうまくいったこと：\nむずかしかったこと：";
      case AppMode.TRAINING:
        return "単元名：\n学習した内容：";
      case AppMode.IDEA:
        return "わたしは（　　　　）と思う。\nなぜなら（　　　　）からだ。";
      default:
        return "";
    }
  };

  const detectMode = (text: string): AppMode | null => {
    const t = text.toLowerCase();
    if (t.includes('1') || t.includes('①') || t.includes('ふりかえり')) return AppMode.REFLECT;
    if (t.includes('2') || t.includes('②') || t.includes('特訓')) return AppMode.TRAINING;
    if (t.includes('3') || t.includes('③') || t.includes('アイデア')) return AppMode.IDEA;
    return null;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      let currentMode = mode;

      if (currentMode === AppMode.INITIAL) {
        const detected = detectMode(userText);
        if (detected) {
          setMode(detected);
          const char = CHARACTERS[detected];
          setMessages(prev => [...prev, { 
            role: 'model', 
            text: `「${char.name}」起動！\n${char.description}`, 
            mode: detected 
          }]);
          setInput(getTemplate(detected));
          setIsLoading(false);
          return;
        }
      }

      const detectedSwitch = detectMode(userText);
      if (detectedSwitch && detectedSwitch !== mode && userText.length < 10) {
        setMode(detectedSwitch);
        const char = CHARACTERS[detectedSwitch];
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: `モードを「${char.name}」に変更したよ！`, 
          mode: detectedSwitch 
        }]);
        setInput(getTemplate(detectedSwitch));
        setIsLoading(false);
        return;
      }

      const aiResponse = await generateResponse(currentMode, userText);
      setMessages(prev => [...prev, { role: 'model', text: aiResponse, mode: currentMode }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: '通信エラーかな？', mode: AppMode.INITIAL }]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentThemeColor = mode === AppMode.INITIAL ? 'cyan' : 
    mode === AppMode.REFLECT ? 'blue' : 
    mode === AppMode.TRAINING ? 'pink' : 'orange';

  const themeHex = currentThemeColor === 'cyan' ? '#22d3ee' : currentThemeColor === 'blue' ? '#3b82f6' : currentThemeColor === 'pink' ? '#ec4899' : '#f97316';

  return (
    <div className="h-screen w-full flex flex-col bg-[#05050a] relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a2e_0%,#05050a_100%)]" />
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, ${themeHex}11 0%, transparent 70%)` }} />
      <div className="scanline opacity-10" />

      {/* 1. Integrated Header */}
      <header className="z-50 p-4 flex justify-between items-center relative">
        <div className="flex items-center gap-3 glass px-4 py-2 rounded-full border-white/5 shadow-2xl">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeHex, boxShadow: `0 0 10px ${themeHex}` }} />
          <h1 className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-70">USAKKO BROTHERS v3.2</h1>
        </div>
        {mode !== AppMode.INITIAL && (
          <button 
            onClick={() => { setMode(AppMode.INITIAL); setInput(''); }}
            className="glass text-[9px] px-4 py-2 rounded-full hover:bg-white/10 transition-all uppercase tracking-widest text-white/50 border-white/5"
          >
            Reset System
          </button>
        )}
      </header>

      {/* 2. Main Visual Stage (Overlapping layers) */}
      <div className="flex-1 relative flex overflow-hidden">
        
        {/* Layer 1: The Character (Behind Chat, Center-Right) */}
        <div className="absolute inset-0 flex items-center justify-center md:justify-[60%] pointer-events-none z-10 transition-all duration-1000">
           <div className="floating transform scale-110 md:scale-150 lg:scale-[1.8] origin-center opacity-80 md:opacity-100">
              <CharacterAvatar mode={mode} size="lg" />
           </div>
           {/* Stage Glow under character */}
           <div className="absolute bottom-[20%] w-[500px] h-20 rounded-[50%] blur-[80px] opacity-20" style={{ backgroundColor: themeHex }} />
        </div>

        {/* Layer 2: Chat Layer (Foreground, Left Focused) */}
        <main className="relative flex-1 z-20 overflow-y-auto px-6 md:px-16 py-6 scrollbar-hide">
          <div className="max-w-md lg:max-w-lg space-y-6">
            {messages.map((msg, i) => (
              <HoloBubble key={i} message={msg} isLatest={i === messages.length - 1} />
            ))}
            <div ref={chatEndRef} className="h-40" />
          </div>
        </main>
      </div>

      {/* 3. Futuristic Integrated Input Panel */}
      <footer className="z-50 p-4 md:p-6 relative bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-2xl mx-auto">
          <div className="glass bg-black/40 border-white/5 rounded-3xl p-2 md:p-3 flex items-end gap-3 shadow-2xl">
            <div className="flex-1 relative pl-2">
               <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={mode === AppMode.INITIAL ? "①・②・③を選んでね..." : "ここに書いてね！"}
                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none h-12 md:h-20 text-white placeholder-white/20 text-sm md:text-base py-2"
              />
              <div className="absolute top-0 left-2 text-[7px] text-white/10 uppercase font-mono tracking-widest">Input_Link_Active</div>
            </div>
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`p-4 md:p-5 rounded-2xl transition-all shrink-0 shadow-lg flex items-center justify-center
                ${!input.trim() || isLoading 
                  ? 'bg-white/5 text-white/10' 
                  : 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white hover:scale-105 active:scale-95 shadow-cyan-500/20'}
              `}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="flex justify-center items-center mt-3 gap-6">
             <div className="flex gap-2 items-center opacity-30">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span className="text-[8px] text-white uppercase font-mono tracking-tighter">Hologram Engine: Ready</span>
             </div>
             <div className="flex gap-2 items-center opacity-30">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                <span className="text-[8px] text-white uppercase font-mono tracking-tighter">Sync Mode: 05</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
