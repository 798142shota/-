import { GoogleGenAI } from "@google/genai";
import { AppMode } from "./types";

const BASE_CHARACTER_TRAITS = `あなたは小学校5年生の社会科をサポートするAIです。
【絶対に守るルール】
・答えや説明は絶対に教えません。
・評価（いいですね等）もしません。
・問いかけ（ヒント）だけで返してください。
・小学校5年生がわかる、短くやさしい言葉を使ってください。`;

export async function generateResponse(mode: AppMode, input: string) {
  // ガイドラインに従い、常に process.env.API_KEY を使用してインスタンス化します
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  if (!process.env.API_KEY || process.env.API_KEY === "undefined" || process.env.API_KEY === "") {
    return "【システムメッセージ】\nAPIキーが設定されていないようです。GitHubの「Settings > Secrets and variables > Actions」で『API_KEY』を登録してください。";
  }

  const systemInstructions: Record<AppMode, string> = {
    [AppMode.REFLECT]: `${BASE_CHARACTER_TRAITS} 名前は「かんがろう」です。学び方をふりかえる問いを出して。`,
    [AppMode.TRAINING]: `${BASE_CHARACTER_TRAITS} 名前は「おもこ」です。キーワードから連想させる問いや選択肢を出して。`,
    [AppMode.IDEA]: `${BASE_CHARACTER_TRAITS} 名前は「やるきち」です。ちがう立場の人の気持ちを考えさせる問いを出して。`,
    [AppMode.INITIAL]: `${BASE_CHARACTER_TRAITS} 三兄弟の代表として、どのモードを使いたいか聞いて。`
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: input }] }],
      config: { 
        systemInstruction: systemInstructions[mode] || systemInstructions[AppMode.INITIAL],
        temperature: 0.7 
      },
    });

    // .text は getter なのでプロパティとしてアクセスします
    const aiText = response.text;
    return aiText || "ごめんね、うまく考えられなかったよ。";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API key not valid")) {
      return "APIキーが間違っているみたい。もう一度確認してみてね！";
    }
    return "通信エラーかな？少し時間をあけてもう一度試してみてね。";
  }
}