import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";

// 初始化 Google Gen AI (會自動讀取 process.env.GEMINI_API_KEY)
const ai = new GoogleGenAI({});

// Zod 驗證請求格式 (防當機防禦)
const CoachRequestSchema = z.object({
  habits: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      completed: z.boolean(),
    }),
  ),
  petLevel: z.number(),
  petExp: z.number(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 嚴格驗證資料
    const parsedData = CoachRequestSchema.parse(body);
    const { habits, petLevel, petExp } = parsedData;

    // 計算完成進度
    const total = habits.length;
    const completed = habits.filter((h) => h.completed).length;
    const uncompletedTitles = habits
      .filter((h) => !h.completed)
      .map((h) => h.title);

    // 呼叫 Gemini AI
    const prompt = `
      你是一隻住在手機裡的電子雞，你是使用者的「專屬習慣教練」。
      現在寵物等級: ${petLevel}，經驗值: ${petExp}。
      今天使用者的習慣達成進度: ${completed}/${total}。
      還沒完成的習慣: ${uncompletedTitles.length > 0 ? uncompletedTitles.join("、") : "都完成了！"}
      
      請根據這個進度，用語氣可愛、有點撒嬌但又帶有教練督促感的口吻，對使用者說一句話（大約 20 到 30 個字）。
      如果他們有未完成的習慣，挑一個提醒他們去做。
      如果全完成了，就熱情地稱讚他們！
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ message: response.text });
  } catch (error) {
    console.error("AI Coach Error:", error);
    return NextResponse.json(
      { message: "嗚嗚... 大廚好像生病了，暫時無法回應..." },
      { status: 500 },
    );
  }
}
