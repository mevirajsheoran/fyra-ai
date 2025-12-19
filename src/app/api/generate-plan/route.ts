import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  createWorkoutPrompt,
  createDietPrompt,
} from "@/lib/prompts";
import {
  UserHealthData,
  WorkoutPlan,
  DietPlan,
} from "@/types/voice-assistant";
import { NextRequest } from "next/server";

// 🔁 PRE-GENERATED FALLBACK PLANS
import preGeneratedPlans from "@/data/preGeneratedPlans.json";

/* ======================
   CONFIG
   ====================== */

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const PRIMARY_MODEL = "models/gemini-2.5-flash";
const TIMEOUT_MS = 30_000;

/* ======================
   HELPERS
   ====================== */

// ⏱ Hard timeout wrapper
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini request timed out")), ms)
    ),
  ]);
}

// 🔢 Deterministic calorie calculation (NO AI)
function calculateDailyCalories(data: UserHealthData): number {
  if (!data.age || !data.weight || !data.height || !data.gender) {
    return 2000;
  }

  const bmr =
    data.gender === "male"
      ? 10 * data.weight + 6.25 * data.height - 5 * data.age + 5
      : 10 * data.weight + 6.25 * data.height - 5 * data.age - 161;

  const activityMultiplier: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  let calories =
    bmr * (activityMultiplier[data.activityLevel ?? "moderate"] ?? 1.55);

  if (data.goal === "lose_weight") calories -= 500;
  if (data.goal === "build_muscle") calories += 300;
  if (data.goal === "improve_fitness") calories += 100;

  return Math.round(calories);
}

// 🧼 Normalize workout plan for Convex safety
function normalizeWorkoutPlan(plan: WorkoutPlan): WorkoutPlan {
  return {
    ...plan,
    exercises: plan.exercises.map((exercise) => ({
      ...exercise,
      routines: exercise.routines.map((routine) => ({
        ...routine,
        sets: typeof routine.sets === "number" ? routine.sets : 0,
        reps: typeof routine.reps === "number" ? routine.reps : 0,
      })),
    })),
  };
}

// 📦 FALLBACK SELECTION
function getWeightRange(weight?: number) {
  if (!weight) return "66-80";
  if (weight <= 65) return "50-65";
  if (weight <= 80) return "66-80";
  return "81-95";
}

function getFallbackPlan(userData: UserHealthData) {
  const weightRange = getWeightRange(userData.weight);

  const match = preGeneratedPlans.find(
    (p: any) =>
      p.profile.gender === userData.gender &&
      p.profile.goal === userData.goal &&
      p.profile.activity === userData.activityLevel &&
      p.profile.weightRange === weightRange
  );

  return match ?? preGeneratedPlans[0];
}

/* ======================
   API HANDLER
   ====================== */

export async function POST(request: NextRequest) {
  try {
    /* ---------- AUTH ---------- */
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userData }: { userData: UserHealthData } =
      await request.json();

    if (!userData?.goal || !userData?.daysPerWeek) {
      return Response.json(
        { error: "Missing required user data" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "GOOGLE_GENERATIVE_AI_API_KEY not set" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    /* ======================
       🏋️ WORKOUT PLAN
       ====================== */

    let workoutPlan: WorkoutPlan;

    try {
      const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
      const result = await withTimeout(
        model.generateContent(createWorkoutPrompt(userData)),
        TIMEOUT_MS
      );

      const text = result.response.text();
      const json = text.match(/\{[\s\S]*\}/)?.[0];
      if (!json) throw new Error("Workout JSON missing");

      workoutPlan = normalizeWorkoutPlan(JSON.parse(json));
    } catch (err) {
      console.error("Workout Gemini failed → fallback used", err);

      const fallback = getFallbackPlan(userData);
      workoutPlan = normalizeWorkoutPlan(fallback.workoutPlan);
    }

    /* ======================
       🥗 DIET PLAN
       ====================== */

    const dailyCalories = calculateDailyCalories(userData);
    let dietPlan: DietPlan;

    try {
      const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
      const result = await withTimeout(
        model.generateContent(
          createDietPrompt(userData, dailyCalories)
        ),
        TIMEOUT_MS
      );

      const text = result.response.text();
      const json = text.match(/\{[\s\S]*\}/)?.[0];
      if (!json) throw new Error("Diet JSON missing");

      dietPlan = JSON.parse(json);
    } catch (err) {
      console.error("Diet Gemini failed → fallback used", err);

      const fallback = getFallbackPlan(userData);
      dietPlan = fallback.dietPlan;
    }

    /* ======================
       💾 SAVE TO CONVEX
       ====================== */

    const goalNames: Record<string, string> = {
      lose_weight: "Weight Loss",
      build_muscle: "Muscle Building",
      maintain: "Maintenance",
      improve_fitness: "Fitness Improvement",
    };

    const planName = `${goalNames[userData.goal] ?? "Fitness"} Plan`;

    const planId = await convex.mutation(api.plans.createPlan, {
      userId,
      name: planName,
      workoutPlan,
      dietPlan,
      isActive: true,
    });

    return Response.json({
      success: true,
      planId,
      planName,
      workoutPlan,
      dietPlan,
    });
  } catch (error: any) {
    console.error("Generate Plan Error:", error);

    return Response.json(
      { error: error.message ?? "Failed to generate plan" },
      { status: 500 }
    );
  }
}
