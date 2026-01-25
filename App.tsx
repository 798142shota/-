
import React, { useState, useEffect, useRef } from 'react';
import { AppMode, Message } from './types';
import { CHARACTERS } from './constants';
import { CharacterAvatar } from './components/CharacterAvatar';
import { HoloBubble } from './components/HoloBubble';
import { generateResponse } from './geminiService';

// v1.0.1 - APIキー設定完了後の自動ビルド用
const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.INITIAL);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const initialGreeting = `こんにちは！社会科の学習をいっしょに進める「うさっこ三兄弟」だよ！✨
今日はどんなことを調べているのかな？

話してみたいメンバーの番号か名前を教えてね！
「もどる」や「スタート」と書くと、いつでもこの画面にもどれるよ。

① 【かんがろう】
社会科の「見方・考え方」を使って、新しい視点を見つけるのを手伝うよ！

② 【おもこ】
大切な言葉をフラッシュカードで覚える特訓をしよう！

③ 【やるきち】
学習方法のアドバイスをして、もっと深く学べるようにサポートするよ！`;

  useEffect(() => {
    setMessages([{ role: 'model', text: initialGreeting, mode: AppMode.INITIAL }]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const detectMode = (text: string): AppMode | null => {
    const t = text.toLowerCase();
    // 戻るコマンド
    if (t.includes('もどる') || t.includes('スタート')) return AppMode.INITIAL;
    
    // キャラクター選択
    if (t.includes('1') || t.includes('①') || t.includes('かんがろう')) return AppMode.IDEA;
    if (t.includes('2') || t.includes('②') || t.includes('おもこ')) return AppMode.TRAINING;
    if (t.includes('3') || t.includes('③') || t.includes('やるきち')) return AppMode.REFLECT;
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
      
      // トップに戻る処理
      if (detected === AppMode.INITIAL && mode !== AppMode.INITIAL) {
        setMode(AppMode.INITIAL);
        setMessages(prev => [...prev, { role: 'model', text: initialGreeting, mode: AppMode.INITIAL }]);
        setIsLoading(false);
        return;
      }

      // キャラクター切り替え処理
      if (detected && detected !== AppMode.INITIAL && (mode === AppMode.INITIAL || userText.length < 10)) {
        setMode(detected);
        const char = CHARACTERS[detected];
        const msg = `${char.name}だよ！よろしくね✨\n${char.description}\n今日はどんなことを考えているの？`;
        setMessages(prev => [...prev, { role: 'model', text: msg, mode: detected }]);
        setIsLoading(false);
        return;
      }

      // 通常の対話
      const aiResponse = await generateResponse(mode, userText);
      if (aiResponse) {
        setMessages(prev => [...prev, { role: 'model', text: aiResponse, mode: mode }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: '通信エラーかな？APIキーの設定を確認してみてね！', mode: AppMode.INITIAL }]);
    } finally {
      setIsLoading(false);
    }
  };

  const themeColor = mode === AppMode.INITIAL ? '#fbbf24' : 
                     mode === AppMode.IDEA ? '#60a5fa' : 
                     mode === AppMode.TRAINING ? '#f472b6' : '#fb923c';

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden font-sans bg-[#fffdf0]">
      {/* ヘッダー */}
      <header className="z-50 p-4 md:p-5 flex justify-center items-center bg-white/80 backdrop-blur-md border-b-4 border-white shrink-0">
        <div className="flex items-center gap-3 md:gap-4 bg-white px-8 md:px-12 py-2 rounded-full shadow-md border-2 border-yellow-100">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full animate-bounce" style={{ backgroundColor: themeColor }} />
          <h1 className="text-base md:text-xl font-black text-slate-700">
            {mode === AppMode.INITIAL ? 'うさっこ三兄弟' : CHARACTERS[mode].name}
          </h1>
        </div>
      </header>

      {/* メインエリア */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-8 shrink-0">
           <div className={`floating transform transition-all duration-700 ${mode === AppMode.INITIAL ? 'scale-90 md:scale-100' : 'scale-100 md:scale-110'}`}>
              <CharacterAvatar mode={mode} size="lg" />
           </div>
        </div>

        <main className="w-full md:w-1/2 flex-1 overflow-y-auto px-6 pt-4 pb-32 scrollbar-hide bg-white/20">
          <div className="max-w-md mx-auto space-y-6">
            {messages.map((msg, i) => (
              <HoloBubble key={i} message={msg} isLatest={i === messages.length - 1} />
            ))}
            <div ref={chatEndRef} className="h-4" />
          </div>
        </main>
      </div>

      {/* 入力欄 */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-gradient-to-t from-[#fffdf0] via-[#fffdf0]/90 to-transparent">
        <div className="max-w-3xl mx-auto flex gap-2 md:gap-3 bg-white p-2 md:p-3 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border-4 border-white">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="ここにメッセージを書いてね！"
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none h-12 md:h-16 text-slate-700 py-3 px-4 md:px-6 text-base md:text-xl font-black placeholder-slate-300"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: themeColor, color: 'white' }}
          >
            {isLoading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-8 md:h-8"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
