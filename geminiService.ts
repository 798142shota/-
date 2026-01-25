import { GoogleGenAI, Modality } from "@google/genai";
import { AppMode } from "./types";

const BASE_CHARACTER_TRAITS = `あなたは小学校5年生の社会科をサポートするキャラクターです。
【重要ルール】
・「うさぎ」や「先生」「AI」とは名乗らないでください。常に自分の名前（かんがろう、おもこ、やるきち）として話してください。
・語尾は「〜だよ！」「〜だね！✨」と明るく元気。
・ふりがな（カッコ書きのひらがな）は一切使わないでください。小学校5年生で習う漢字はそのまま使い、自然な文章にしてください。

【AIの役割：提案型】
・社会科の学習内容（農業、水産業、工業、情報、環境）について、具体的なデータや「こんな見方はどう？」という提案を必ず含めてください。
・問いかけをセットにして、子供が自分で考えるきっかけを作ります。

【TTSルール】
・音声合成が聞き取りやすいよう、適度に読点（、）を入れてください。`;

export async function generateResponse(mode: AppMode, input: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstructions: Record<AppMode, string> = {
    [AppMode.REFLECT]: `${BASE_CHARACTER_TRAITS} あなたは「かんがろう」です。ふりかえりを助けます。比較や変化の視点を提案してください。`,
    [AppMode.TRAINING]: `${BASE_CHARACTER_TRAITS} あなたは「おもこ」です。知識の定着を助けます。重要なキーワードや面白い事実を提案してください。`,
    [AppMode.IDEA]: `${BASE_CHARACTER_TRAITS} あなたは「やるきち」です。アイデアを広げます。違う立場や新しい視点を提案してください。`,
    [AppMode.INITIAL]: `${BASE_CHARACTER_TRAITS} かんがろう、おもこ、やるきちの誰と話したいか選んでもらってください。`
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: input }] }],
      config: { 
        systemInstruction: systemInstructions[mode],
        temperature: 0.7 
      },
    });
    return response.text;
  } catch (error) {
    return "もう一度送ってみてね！";
  }
}

export async function speakText(text: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
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