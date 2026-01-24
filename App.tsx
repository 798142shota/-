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

  const initialGreeting = `ヤッホー！ボクたちは「うさぎ三兄弟」だよ！
社会科の勉強を、ボクたちがドンドン盛り上げていくね！

何をしたいか選んで、番号で教えて！

①【かんがろう】と「ふりかえり」をする
（今の考えと前の考えを比べて、新しい発見を提案するよ！）

②【おもこ】と「知識の特訓」をする
（教科書の大事な言葉や、面白い豆知識をクイズにするよ！）

③【やるきち】と「アイデア出し」をする
（農家の人や外国の人など、いろんな人の立場を提案するよ！）`;

  useEffect(() => {
    setMessages([{ role: 'model', text: initialGreeting, mode: AppMode.INITIAL }]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const detectMode = (text: string): AppMode | null => {
    const t = text.toLowerCase();
    if (t.includes('1') || t.includes('①') || t.includes('ふりかえり') || t.includes('かんがろう')) return AppMode.REFLECT;
    if (t.includes('2') || t.includes('②') || t.includes('特訓') || t.includes('おもこ')) return AppMode.TRAINING;
    if (t.includes('3') || t.includes('③') || t.includes('アイデア') || t.includes('やるきち')) return AppMode.IDEA;
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
      let currentMode = mode;

      if (detected && (userText.length < 15 || mode === AppMode.INITIAL)) {
        setMode(detected);
        currentMode = detected;
        const char = CHARACTERS[detected];
        const transitionMsg = `「${char.name}」に任せて！\n${char.description}\nさっそくだけど、今日は社会科のどんなことを調べてるの？`;
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: transitionMsg, 
          mode: detected 
        }]);
        setIsLoading(false);
        return;
      }

      const aiResponse = await generateResponse(currentMode, userText);
      setMessages(prev => [...prev, { role: 'model', text: aiResponse, mode: currentMode }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'ごめんね、電波が弱かったみたい。もう一度送ってくれるかな？', mode: AppMode.INITIAL }]);
    } finally {
      setIsLoading(false);
    }
  };

  const themeHex = mode === AppMode.INITIAL ? '#ffffff' : mode === AppMode.REFLECT ? '#3b82f6' : mode === AppMode.TRAINING ? '#ec4899' : '#f97316';

  return (
    <div className="h-screen w-full flex flex-col bg-[#05050a] relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#1a1a3a_0%,#05050a_100%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-1000" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, ${themeHex}44 0%, transparent 70%)` }} />
      <div className="scanline opacity-[0.05]" />

      <header className="z-50 p-6 flex justify-between items-center relative pointer-events-none">
        <div className="flex items-center gap-3 glass px-5 py-2 rounded-full border-white/10 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: themeHex }} />
          <h1 className="text-xs font-bold tracking-[0.4em] uppercase opacity-70">
            {mode === AppMode.INITIAL ? 'SELECT MODE' : mode}
          </h1>
        </div>
        {mode !== AppMode.INITIAL && (
          <button 
            onClick={() => { setMode(AppMode.INITIAL); setMessages([{role: 'model', text: initialGreeting, mode: AppMode.INITIAL}]); }}
            className="glass text-[10px] px-5 py-2 rounded-full hover:bg-white/10 transition-all uppercase tracking-widest text-white/60 border-white/10 pointer-events-auto shadow-lg"
          >
            ← 三兄弟に戻る
          </button>
        )}
      </header>

      <div className="flex-1 relative flex flex-col">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 transition-all duration-1000">
           <div className={`floating transform transition-all duration-1000 ${mode === AppMode.INITIAL ? 'scale-100' : 'scale-110 md:scale-125 md:translate-x-[25%]'}`}>
              <CharacterAvatar mode={mode} size="lg" />
           </div>
        </div>

        <main className="relative flex-1 z-20 overflow-y-auto px-6 md:px-16 pt-8 pb-32 scrollbar-hide">
          <div className="max-w-md lg:max-w-xl space-y-6">
            {messages.map((msg, i) => (
              <HoloBubble key={i} message={msg} isLatest={i === messages.length - 1} />
            ))}
            <div ref={chatEndRef} className="h-20" />
          </div>
        </main>
      </div>

      <footer className="z-50 p-6 relative bg-gradient-to-t from-[#05050a] via-[#05050a]/90 to-transparent">
        <div className="max-w-2xl mx-auto">
          <div className="glass bg-white/5 border-white/10 rounded-[2.5rem] p-2 flex items-center gap-2 shadow-2xl overflow-hidden backdrop-blur-3xl">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={mode === AppMode.INITIAL ? "やりたいことを番号で選んでね！" : "うさぎに話しかけてみて！"}
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none resize-none h-14 md:h-20 text-white placeholder-white/20 text-base py-4 px-6 scrollbar-hide"
            />
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`w-14 h-14 md:w-20 md:h-20 rounded-[2rem] transition-all shrink-0 flex items-center justify-center
                ${!input.trim() || isLoading 
                  ? 'bg-white/5 text-white/10' 
                  : 'bg-gradient-to-br from-blue-400 to-blue-700 text-white hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/30'}
              `}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;