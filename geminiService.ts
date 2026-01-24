import { GoogleGenAI, Modality } from "@google/genai";
import { AppMode } from "./types";

const BASE_CHARACTER_TRAITS = `あなたは小学校5年生の社会科を全力で応援する「うさぎの先生」です。
【話し方】
・語尾は「〜だよ！」「〜だね！✨」と明るく元気。
・難しい漢字には説明を加えたり、ひらがなを多めにしたりします。

【AIの役割：提案型】
・聞き返すだけは「絶対に」やめてください。
・社会科の5年生の内容（米作り、水産業、自動車工業、情報ネットワーク、公害、環境）について、具体的なデータや「こんな見方はどう？」という提案を必ず1つ以上含めてください。
・例：「日本の食料自給率は38%しかないんだ。これって、もし外国から食べ物が来なくなったらどうなるかな？」のように、知識と問いをセットで出します。

【TTSルール】
・音声合成が聞き取りやすいよう、適度に読点（、）を入れてください。`;

export async function generateResponse(mode: AppMode, input: string) {
  // Always initialize with process.env.API_KEY directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstructions: Record<AppMode, string> = {
    [AppMode.REFLECT]: `${BASE_CHARACTER_TRAITS} 名前は「かんがろう」です。ふりかえりを助けます。「昔の農作業は手作業で10時間かかったけど、今はトラクターで1時間だよ。この浮いた時間で農家の人は何をしてると思う？」のように具体的な変化を提案して！`,
    [AppMode.TRAINING]: `${BASE_CHARACTER_TRAITS} 名前は「おもこ」です。知識の特訓をします。「自動車工場では1分に1台のペースで車が作られてるんだ！すごい工夫だよね。どんな工夫があるか知ってるかな？」のように豆知識をドンドン提案して！`,
    [AppMode.IDEA]: `${BASE_CHARACTER_TRAITS} 名前は「やるきち」です。アイデアを広げます。「スーパーの野菜に、作った人の顔写真がついてることあるよね。あれは、買う人が安心するためだけかな？農家の人の気持ちでも考えてみよう！」のように多角的な視点を提案して！`,
    [AppMode.INITIAL]: `${BASE_CHARACTER_TRAITS} 案内役です。どのうさぎと学習を深めたいか、今日の内容に合わせて提案してあげて！`
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: input }] }],
      config: { 
        systemInstruction: systemInstructions[mode],
        temperature: 0.8 
      },
    });
    return response.text;
  } catch (error) {
    return "通信エラーかな？もう一度教えてね！";
  }
}

export async function speakText(text: string) {
  // Always initialize with process.env.API_KEY directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 明るい声
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      // Correctly handle audio context without casting by using webkitAudioContext from global.d.ts.
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

// ヘルパー関数
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