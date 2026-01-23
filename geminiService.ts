
import { GoogleGenAI } from "@google/genai";
import { AppMode } from "./types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const BASE_CHARACTER_TRAITS = `あなたは小学校5年生の社会科をサポートするAIです。絶対に答えを教えず、問いかけだけで返してください。短くやさしい言葉を使ってください。`;

export async function generateResponse(mode: AppMode, input: string) {
  const ai = getAIClient();
  if (!ai) {
    return "【システムエラー】APIキーが設定されていないよ。GitHubのSettingsからAPI_KEYを登録してね！";
  }

  const systemInstructions: Record<AppMode, string> = {
    [AppMode.REFLECT]: `${BASE_CHARACTER_TRAITS} 名前は「かんがろう」です。学び方を振り返る問いを出してください。`,
    [AppMode.TRAINING]: `${BASE_CHARACTER_TRAITS} 名前は「おもこ」です。キーワードから連想させる問いや選択肢を出してください。`,
    [AppMode.IDEA]: `${BASE_CHARACTER_TRAITS} 名前は「やるきち」です。立場を変えて考えさせる問いを出してください。`,
    [AppMode.INITIAL]: `${BASE_CHARACTER_TRAITS} 三兄弟の代表として挨拶してください。`
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: input }] }],
      config: { systemInstruction: systemInstructions[mode] || systemInstructions[AppMode.INITIAL] },
    });
    return response.text;
  } catch (error) {
    return "通信エラーかな？少し時間をあけてもう一度試してみてね。";
  }
}
