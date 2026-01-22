
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
社会科の勉強、いっしょにがんばろうね。
まずは、どのモードで遊びたいか教えて！

① ふりかえりモード
② 特訓モード
③ アイデアモード`;

  useEffect(() => {
    setMessages([{ role: 'model', text: initialGreeting, mode: AppMode.INITIAL }]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      const detected = detectMode(userText);
      let currentMode = mode;

      if (detected && userText.length < 15) {
        setMode(detected);
        currentMode = detected;
        const char = CHARACTERS[detected];
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: `「${char.name}」にバトンタッチ！\n${char.description}\nなにか話しかけてみてね！`, 
          mode: detected 
        }]);
        setIsLoading(false);
        return;
      }

      const aiResponse = await generateResponse(currentMode, userText);
      setMessages(prev => [...prev, { role: 'model', text: aiResponse, mode: currentMode }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'ごめん、ちょっと調子が悪いみたい。もう一回送ってくれる？', mode: AppMode.INITIAL }]);
    } finally {
      setIsLoading(false);
    }
  };

  const themeHex = mode === AppMode.INITIAL ? '#ffffff' : mode === AppMode.REFLECT ? '#3b82f6' : mode === AppMode.TRAINING ? '#ec4899' : '#f97316';

  return (
    <div className="h-screen w-full flex flex-col bg-[#05050a] relative overflow-hidden font-sans">
      {/* 舞台背景 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#1e1e3f_0%,#05050a_100%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, ${themeHex} 0%, transparent 70%)` }} />
      <div className="scanline opacity-[0.05]" />

      {/* ヘッダー */}
      <header className="z-50 p-4 flex justify-between items-center relative pointer-events-none">
        <div className="flex items-center gap-3 glass px-4 py-1.5 rounded-full border-white/5 pointer-events-auto">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeHex }} />
          <h1 className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">USAKKO STAGE V3</h1>
        </div>
        {mode !== AppMode.INITIAL && (
          <button 
            onClick={() => { setMode(AppMode.INITIAL); setMessages([{role: 'model', text: initialGreeting, mode: AppMode.INITIAL}]); }}
            className="glass text-[9px] px-4 py-1.5 rounded-full hover:bg-white/10 transition-all uppercase tracking-widest text-white/50 border-white/5 pointer-events-auto"
          >
            Switch Mode
          </button>
        )}
      </header>

      {/* ステージエリア */}
      <div className="flex-1 relative flex flex-col">
        
        {/* キャラクター層: 中央に配置 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 transition-all duration-1000 overflow-visible">
           <div className={`floating transform transition-all duration-1000 ${mode === AppMode.INITIAL ? 'scale-100 translate-y-0' : 'scale-110 md:scale-125 translate-y-[-20px] md:translate-x-[20%]'}`}>
              <CharacterAvatar mode={mode} size="lg" />
           </div>
           
           {/* 床面の光 */}
           <div className="absolute bottom-[20%] w-[300px] md:w-[600px] h-10 rounded-[50%] blur-[40px] opacity-20" style={{ backgroundColor: themeHex }} />
           <div className="absolute bottom-[20.5%] w-[200px] md:w-[400px] h-4 border-t border-white/10 rounded-[50%] blur-[2px] opacity-10" />
        </div>

        {/* 会話層: キャラクターと少し重なるように配置 */}
        <main className="relative flex-1 z-20 overflow-y-auto px-6 md:px-12 pt-6 pb-24 scrollbar-hide">
          <div className="max-w-md lg:max-w-lg space-y-4">
            {messages.map((msg, i) => (
              <HoloBubble key={i} message={msg} isLatest={i === messages.length - 1} />
            ))}
            <div ref={chatEndRef} className="h-20" />
          </div>
        </main>
      </div>

      {/* 入力パネル */}
      <footer className="z-50 p-4 md:p-6 relative bg-gradient-to-t from-[#05050a] via-[#05050a]/80 to-transparent">
        <div className="max-w-2xl mx-auto">
          <div className="glass bg-black/60 border-white/10 rounded-[2rem] p-2 flex items-center gap-2 shadow-2xl overflow-hidden">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={mode === AppMode.INITIAL ? "何番にする？それともボクたちに挨拶してみて！" : "うさぎに話しかけてみてね..."}
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none resize-none h-12 md:h-16 text-white placeholder-white/20 text-sm md:text-base py-3 px-4 scrollbar-hide"
            />
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl transition-all shrink-0 flex items-center justify-center
                ${!input.trim() || isLoading 
                  ? 'bg-white/5 text-white/10' 
                  : 'bg-gradient-to-br from-blue-500 to-indigo-700 text-white hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20'}
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
        </div>
      </footer>
    </div>
  );
};

export default App;
