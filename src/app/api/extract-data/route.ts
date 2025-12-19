// src/app/api/extract-data/route.ts

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DATA_EXTRACTION_PROMPT } from "@/lib/prompts";
import { Message, UserHealthData } from "@/types/voice-assistant";
import { NextRequest } from "next/server";

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";

export async function POST(request: NextRequest) {
  try {
    // 🔐 Auth check
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationHistory }: { conversationHistory: Message[] } =
      await request.json();

    if (!conversationHistory || conversationHistory.length === 0) {
      return Response.json(
        { error: "Conversation history is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "GOOGLE_GENERATIVE_AI_API_KEY not configured" },
        { status: 500 }
      );
    }

    // 🧠 Build conversation text
    const conversationText = conversationHistory
      .map(
        (msg) =>
          `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    // 🧩 Build extraction prompt
    const prompt = DATA_EXTRACTION_PROMPT.replace(
      "{conversation}",
      conversationText
    );

    const genAI = new GoogleGenerativeAI(apiKey);

    let responseText: string;

    try {
      // ✅ Primary model
      const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } catch (primaryError) {
      console.error("Primary model failed, falling back:", primaryError);

      // 🔁 Fallback model
      const fallbackModel = genAI.getGenerativeModel({
        model: FALLBACK_MODEL,
      });
      const fallbackResult = await fallbackModel.generateContent(prompt);
      responseText = fallbackResult.response.text();
    }

    // ⚠️ Gemini may include text around JSON — extract safely
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from Gemini response");
    }

    const extractedData: UserHealthData = JSON.parse(jsonMatch[0]);

    // ✅ Required fields check
    const requiredFields: (keyof UserHealthData)[] = [
      "name",
      "age",
      "weight",
      "height",
      "goal",
      "daysPerWeek",
      "workoutPreference",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        extractedData[field] === null ||
        extractedData[field] === undefined
    );

    return Response.json({
      data: extractedData,
      isComplete: missingFields.length === 0,
      missingFields,
    });
  } catch (error) {
    console.error("Data Extraction Error:", error);

    return Response.json(
      { error: "Failed to extract data" },
      { status: 500 }
    );
  }
}
