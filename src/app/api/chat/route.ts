// src/app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";

/* =========================
   DETERMINISTIC QUESTIONS
   ========================= */

const QUESTIONS = [
  "Hi {name}, I’m your personal AI fitness assistant. Welcome! I’ll ask you a few questions to understand your profile and create a personalized fitness plan. Let’s start with your age, gender, height, and weight.",

  "Alright {name}, now tell me your fitness goal, activity level, experience, preferred workout location (home or gym), and how many days per week you can train..",

  "Great {name}. Final question: do you have any dietary preferences, health conditions, or injuries? ",
];

/* =========================
   API HANDLER
   ========================= */

export async function POST(req: NextRequest) {
  try {
    /* ---------- READ BODY ONCE ---------- */
    const body = await req.json();
    const {
      conversationHistory = [],
      turnNumber,
      userName,
    } = body;

    /* ---------- HARD GUARD ---------- */
    if (typeof turnNumber !== "number") {
      return NextResponse.json(
        { error: "turnNumber is required" },
        { status: 400 }
      );
    }

    /* ---------- COMPLETION ---------- */
    if (turnNumber > QUESTIONS.length) {
      return NextResponse.json({
        message:
          "Great! I have all the required details. Your personalized fitness plan is being generated—please wait, you’ll be redirected shortly.",
        isComplete: true,
      });
    }

    /* ---------- QUESTION SELECTION ---------- */
    const rawQuestion = QUESTIONS[turnNumber - 1];
    if (!rawQuestion) {
      return NextResponse.json(
        { error: "Invalid conversation turn" },
        { status: 400 }
      );
    }

    const question = rawQuestion.replace(
      "{name}",
      userName || "there"
    );

    /* ---------- RETURN DIRECTLY (NO LLM) ---------- */
    return NextResponse.json({
      message: question,
      isComplete: false,
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
