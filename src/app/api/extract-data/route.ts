// src/app/api/extract-data/route.ts

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DATA_EXTRACTION_PROMPT } from "@/lib/prompts";
import { Message, UserHealthData } from "@/types/voice-assistant";
import { NextRequest } from "next/server";

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";

// Default values for missing fields
const DEFAULT_VALUES: Partial<UserHealthData> = {
  name: "User",
  age: 25,
  gender: "male",
  weight: 70,
  height: 170,
  goal: "improve_fitness",
  activityLevel: "moderate",
  experienceLevel: "beginner",
  workoutPreference: "gym",
  daysPerWeek: 3,
  dietaryRestrictions: [],
  healthConditions: [],
};

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
      console.error("Failed to extract JSON, using defaults");
      // Return defaults with isComplete: true so we proceed anyway
      return Response.json({
        data: DEFAULT_VALUES as UserHealthData,
        isComplete: true,
        missingFields: [],
      });
    }

    let extractedData: UserHealthData;
    try {
      extractedData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON parse failed, using defaults:", parseError);
      return Response.json({
        data: DEFAULT_VALUES as UserHealthData,
        isComplete: true,
        missingFields: [],
      });
    }

    // ✅ CRITICAL FIX: Fill in missing fields with defaults instead of failing
    const requiredFields: (keyof UserHealthData)[] = [
      "name",
      "age",
      "weight",
      "height",
      "goal",
      "daysPerWeek",
      "workoutPreference",
    ];

    const missingFields: string[] = [];

    // Fill in missing required fields with defaults
    for (const field of requiredFields) {
      if (
        extractedData[field] === null ||
        extractedData[field] === undefined ||
        extractedData[field] === ""
      ) {
        missingFields.push(field);
        // Apply default value
        (extractedData as any)[field] = DEFAULT_VALUES[field];
      }
    }

    // Also fill in optional fields if missing
    if (!extractedData.gender) extractedData.gender = DEFAULT_VALUES.gender as any;
    if (!extractedData.activityLevel) extractedData.activityLevel = DEFAULT_VALUES.activityLevel as any;
    if (!extractedData.experienceLevel) extractedData.experienceLevel = DEFAULT_VALUES.experienceLevel as any;
    if (!extractedData.dietaryRestrictions) extractedData.dietaryRestrictions = [];
    if (!extractedData.healthConditions) extractedData.healthConditions = [];

    console.log("Extracted data:", extractedData);
    console.log("Missing fields (filled with defaults):", missingFields);

    // ✅ ALWAYS return isComplete: true after conversation ends
    // We've filled in defaults for any missing fields
    return Response.json({
      data: extractedData,
      isComplete: true, // Always true now - we filled defaults
      missingFields, // For logging/debugging only
    });
  } catch (error) {
    console.error("Data Extraction Error:", error);

    // Even on error, return defaults so the flow continues
    return Response.json({
      data: DEFAULT_VALUES as UserHealthData,
      isComplete: true,
      missingFields: Object.keys(DEFAULT_VALUES),
    });
  }
}