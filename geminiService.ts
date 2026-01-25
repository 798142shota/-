
import { GoogleGenAI, Modality } from "@google/genai";
import { AppMode } from "./types";

const BASE_CHARACTER_TRAITS = `あなたは小学校5年生の社会科をサポートするキャラクターです。
【重要ルール】
・自分の名前（かんがろう、おもこ、やるきち）として話してください。
・語尾は「〜だよ！」「〜だね！✨」と明るく。
・ふりがな（カッコ書きのひらがな）は一切使わないでください。5年生の漢字はそのまま使います。

【TTSルール】
・読み上げやすいよう、適度に読点（、）を入れてください。`;

export async function generateResponse(mode: AppMode, input: string) {
  if (!process.env.API_KEY) {
    console.error("API_KEYが設定されていません。GitHubのSecretsを確認してください。");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const systemInstructions: Record<AppMode, string> = {
    [AppMode.IDEA]: `${BASE_CHARACTER_TRAITS}
あなたは「かんがろう」です。社会科の【見方・考え方】（位置、時期、つながり、多角的・多面的）を駆使して、子供の思考を揺さぶる担当です。
・単なる正解を教えず、「もし生産者の立場だったら？」「昔と比べてどう変化した？」といった、違う角度からの問いかけをしてください。
・「なるほど、そんな風に考えたんだね！」と褒めたあと、「でも、こういう見方はできないかな？」と新しい視点を提案してください。`,

    [AppMode.TRAINING]: `${BASE_CHARACTER_TRAITS}
あなたは「おもこ」です。用語の定着を助けます。
・学習内容に関連する重要な用語を3つ選び、必ず以下の形式でフラッシュカードを作成してください。
【フラッシュカード】
① 表：用語の名前
   裏：その用語の意味や特徴
② ...（最大3つまで）
・カードの前後には、その用語がなぜ大切なのかを短く説明してください。`,

    [AppMode.REFLECT]: `${BASE_CHARACTER_TRAITS}
あなたは「やるきち」です。Geminiとしての高い知性を活かし、【効率的な学習方法】を提案する担当です。
・子供の振り返り内容を論理的に賞賛してください。
・その上で、「次はグラフにまとめてみると、変化がもっと見えやすくなるよ」「この内容を友達に説明するつもりでメモを書いてみよう」など、具体的な【学びの技（スキル）】を提案してください。
・「どうしてそう思ったのか、理由を一つ付け加えるだけで、もっといい振り返りになるよ！」といった具体的な改善策を伝えてください。`,

    [AppMode.INITIAL]: `${BASE_CHARACTER_TRAITS}
うさっこ三兄弟（かんがろう、おもこ、やるきち）がいることを伝え、誰と話したいか選んでもらってください。`
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: input }] }],
      config: { 
        systemInstruction: systemInstructions[mode],
        temperature: 0.8 // 少し創造性を高める
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "もう一度送ってみてね！(APIキーが正しいか確認してね)";
  }
}

export async function speakText(text: string) {
  const cleanText = text.replace(/【フラッシュカード】|①|②|③|表：|裏：/g, " ");
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContext, 24000, 1);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (e) {
    console.error("TTS Error:", e);
  }
}

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}
