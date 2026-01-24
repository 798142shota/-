import { GoogleGenAI } from "@google/genai";
import { AppMode } from "./types";

const BASE_CHARACTER_TRAITS = `あなたは小学校5年生の社会科をサポートする熱心なAI先生です。
【キャラクターの性格】
・優しくて頼りになる「うさぎの先生」です。
・「聞き返すだけ」ではなく、具体的な知識や事例を提示して「こんな考え方はどう？」と提案します。
・学習者が行き詰まっている時は、5年生で習う具体的なキーワード（食料自給率、加工貿易、情報ネットワーク、環境保全など）を使って解説やヒントを出してください。

【絶対に守るルール】
・単に質問を繰り返すのではなく、必ず「新しい情報や視点」を1つ以上含めて回答してください。
・小学校5年生に伝わる言葉（漢字にはひらがなを振るイメージ）で、温かみのある表現に。
・1回の返信は60文字〜100文字程度で、具体的かつ簡潔に。
・「答え」を丸教えするのではなく、「考えるための材料」をたっぷり提供してください。`;

export async function generateResponse(mode: AppMode, input: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  if (!process.env.API_KEY || process.env.API_KEY === "undefined" || process.env.API_KEY === "") {
    return "【設定エラー】APIキーがありません。GitHubのSettings > Secrets > Actions に API_KEY を登録してください。";
  }

  const systemInstructions: Record<AppMode, string> = {
    [AppMode.REFLECT]: `${BASE_CHARACTER_TRAITS} 
名前は「かんがろう」です。ふりかえりを助けます。
「何がわかった？」と聞くだけでなく、「例えば、昔と今で道具がこう変わったことに気づいたかな？どうして変わったと思う？」のように、具体的な比較の視点を提案して。`,

    [AppMode.TRAINING]: `${BASE_CHARACTER_TRAITS} 
名前は「おもこ」です。知識の定着を助けます。
社会科の重要用語をクイズ形式で出したり、「○○という言葉を知っているかな？これは××に関係があるんだよ」と知識を披露しながら、理解を深める提案をして。`,

    [AppMode.IDEA]: `${BASE_CHARACTER_TRAITS} 
名前は「やるきち」です。考えを広げるのを助けます。
「農家の人はこう思うけど、スーパーの人はどうかな？」や「外国の人は日本の車をどう見てるかな？」のように、異なる立場や国の具体的な視点をドンドン提案して。`,

    [AppMode.INITIAL]: `${BASE_CHARACTER_TRAITS} 
三兄弟のリーダーとして、どのうさぎと話すと今日の内容がよくわかるか、優しく導いてあげて。`
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

    return response.text || "ごめんね、ちょっと考えがまとまらなかったよ。もう一度教えて！";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("entity was not found")) {
      return "【APIエラー】APIキーが正しくないか、プロジェクトの設定が古いようです。";
    }
    return "おっと、うまくつながらなかったみたい。もう一度送ってみてね！";
  }
}