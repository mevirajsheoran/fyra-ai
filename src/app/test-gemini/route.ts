// src/app/api/test-gemini/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GOOGLE_GENERATIVE_AI_API_KEY" },
      { status: 500 }
    );
  }

  try {
    // 1️⃣ Discover models via REST (SDK does NOT support this)
    const modelsRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
    );

    const modelsData = await modelsRes.json();

    if (!modelsData.models) {
      throw new Error("Failed to fetch models");
    }

    // 2️⃣ Filter text-generation models
    const textModels = modelsData.models.filter((m: any) =>
      m.supportedGenerationMethods?.includes("generateContent")
    );

    // 3️⃣ Pick a preferred model (fallback safe)
    const chosenModel =
      textModels.find((m: any) => m.name.includes("gemini-1.5-flash")) ??
      textModels[0];

    if (!chosenModel) {
      throw new Error("No text-capable Gemini model found");
    }

    // 4️⃣ Generate content
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: chosenModel.name.replace("models/", ""),
    });

    const result = await model.generateContent(
      "Say hello in exactly five words"
    );

    return NextResponse.json({
      status: "success",
      chosenModel: chosenModel.name,
      availableTextModels: textModels.map((m: any) => m.name),
      output: result.response.text(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "failed",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
