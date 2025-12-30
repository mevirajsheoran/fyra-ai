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

// 🔁 PRE-GENERATED FALLBACK PLANS (72 plans)
import preGeneratedPlans from "@/data/preGeneratedPlans.json";

/* ======================
   CONFIG
   ====================== */

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";
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

// 🧼 Normalize diet plan to ensure dailyCalories is set
function normalizeDietPlan(plan: DietPlan, calculatedCalories: number): DietPlan {
  return {
    ...plan,
    dailyCalories: plan.dailyCalories || calculatedCalories,
    meals: plan.meals || [],
  };
}

// 📏 Get weight range category
function getWeightRange(weight: number | null | undefined): string {
  if (weight == null) return "66-80";
  if (weight <= 65) return "50-65";
  if (weight <= 80) return "66-80";
  return "81-95";
}

// 📏 Map activity level to match pre-generated plans
function mapActivityLevel(activityLevel: string | null | undefined): string {
  const mapping: Record<string, string> = {
    sedentary: "sedentary",
    light: "sedentary",
    moderate: "moderate",
    active: "active",
    very_active: "active",
  };
  return mapping[activityLevel ?? "moderate"] ?? "moderate";
}

// 📦 FALLBACK SELECTION - Progressive matching
function getFallbackPlan(userData: UserHealthData) {
  const weightRange = getWeightRange(userData.weight);
  const mappedActivity = mapActivityLevel(userData.activityLevel);
  const gender = userData.gender ?? "male";
  const goal = userData.goal ?? "improve_fitness";

  console.log("🔍 Looking for fallback plan with:", {
    gender,
    goal,
    activity: mappedActivity,
    weightRange,
  });

  // Level 1: Try exact match
  let match = preGeneratedPlans.find(
    (p: any) =>
      p.profile.gender === gender &&
      p.profile.goal === goal &&
      p.profile.activity === mappedActivity &&
      p.profile.weightRange === weightRange
  );

  if (match) {
    console.log("✅ Found exact match");
    return match;
  }

  // Level 2: Try without weight range
  match = preGeneratedPlans.find(
    (p: any) =>
      p.profile.gender === gender &&
      p.profile.goal === goal &&
      p.profile.activity === mappedActivity
  );

  if (match) {
    console.log("✅ Found match (ignoring weight range)");
    return match;
  }

  // Level 3: Try without activity level
  match = preGeneratedPlans.find(
    (p: any) =>
      p.profile.gender === gender &&
      p.profile.goal === goal
  );

  if (match) {
    console.log("✅ Found match (ignoring activity and weight)");
    return match;
  }

  // Level 4: Try just gender
  match = preGeneratedPlans.find(
    (p: any) => p.profile.gender === gender
  );

  if (match) {
    console.log("✅ Found match (gender only)");
    return match;
  }

  // Ultimate fallback - first plan
  console.log("⚠️ Using first plan as ultimate fallback");
  return preGeneratedPlans[0];
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

    const { userData }: { userData: UserHealthData } = await request.json();

    console.log("📊 Received userData:", userData);

    // Validate required fields (with defaults fallback)
    if (!userData) {
      return Response.json(
        { error: "Missing user data" },
        { status: 400 }
      );
    }

    // Apply defaults for missing fields
    const normalizedUserData: UserHealthData = {
      name: userData.name ?? "User",
      age: userData.age ?? 25,
      gender: userData.gender ?? "male",
      weight: userData.weight ?? 70,
      height: userData.height ?? 170,
      goal: userData.goal ?? "improve_fitness",
      activityLevel: userData.activityLevel ?? "moderate",
      experienceLevel: userData.experienceLevel ?? "beginner",
      workoutPreference: userData.workoutPreference ?? "gym",
      daysPerWeek: userData.daysPerWeek ?? 3,
      dietaryRestrictions: userData.dietaryRestrictions ?? [],
      healthConditions: userData.healthConditions ?? [],
    };

    console.log("📊 Normalized userData:", normalizedUserData);

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    // Track if we're using fallback
    let usedFallback = false;
    let workoutPlan: WorkoutPlan;
    let dietPlan: DietPlan;
    const dailyCalories = calculateDailyCalories(normalizedUserData);

    /* ======================
       🏋️ WORKOUT PLAN
       ====================== */

    if (!apiKey) {
      console.log("⚠️ No API key - using fallback plans");
      usedFallback = true;
      const fallback = getFallbackPlan(normalizedUserData);
      workoutPlan = normalizeWorkoutPlan(fallback.workoutPlan as WorkoutPlan);
      dietPlan = normalizeDietPlan(fallback.dietPlan as DietPlan, dailyCalories);
    } else {
      const genAI = new GoogleGenerativeAI(apiKey);

      // Try to generate workout plan with AI
      try {
        console.log("🤖 Attempting Gemini workout generation...");
        
        let result;
        try {
          // Try primary model first
          const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
          result = await withTimeout(
            model.generateContent(createWorkoutPrompt(normalizedUserData)),
            TIMEOUT_MS
          );
        } catch (primaryError) {
          console.log("⚠️ Primary model failed, trying fallback model...");
          // Try fallback model
          const fallbackModel = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
          result = await withTimeout(
            fallbackModel.generateContent(createWorkoutPrompt(normalizedUserData)),
            TIMEOUT_MS
          );
        }

        const text = result.response.text();
        const json = text.match(/\{[\s\S]*\}/)?.[0];
        
        if (!json) {
          throw new Error("Workout JSON not found in response");
        }

        workoutPlan = normalizeWorkoutPlan(JSON.parse(json));
        console.log("✅ Gemini workout plan generated successfully");

      } catch (err: any) {
        console.error("❌ Workout Gemini failed → using fallback:", err.message);
        usedFallback = true;
        const fallback = getFallbackPlan(normalizedUserData);
        workoutPlan = normalizeWorkoutPlan(fallback.workoutPlan as WorkoutPlan);
      }

      /* ======================
         🥗 DIET PLAN
         ====================== */

      if (!usedFallback) {
        try {
          console.log("🤖 Attempting Gemini diet generation...");
          
          let result;
          try {
            // Try primary model first
            const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
            result = await withTimeout(
              model.generateContent(createDietPrompt(normalizedUserData, dailyCalories)),
              TIMEOUT_MS
            );
          } catch (primaryError) {
            console.log("⚠️ Primary model failed, trying fallback model...");
            // Try fallback model
            const fallbackModel = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
            result = await withTimeout(
              fallbackModel.generateContent(createDietPrompt(normalizedUserData, dailyCalories)),
              TIMEOUT_MS
            );
          }

          const text = result.response.text();
          const json = text.match(/\{[\s\S]*\}/)?.[0];
          
          if (!json) {
            throw new Error("Diet JSON not found in response");
          }

          dietPlan = normalizeDietPlan(JSON.parse(json), dailyCalories);
          console.log("✅ Gemini diet plan generated successfully");

        } catch (err: any) {
          console.error("❌ Diet Gemini failed → using fallback:", err.message);
          const fallback = getFallbackPlan(normalizedUserData);
          dietPlan = normalizeDietPlan(fallback.dietPlan as DietPlan, dailyCalories);
        }
      } else {
        // Already using fallback for workout, use same for diet
        const fallback = getFallbackPlan(normalizedUserData);
        dietPlan = normalizeDietPlan(fallback.dietPlan as DietPlan, dailyCalories);
      }
    }

    // Ensure diet plan has calculated calories (override if needed)
    dietPlan.dailyCalories = dailyCalories;

    /* ======================
       💾 SAVE TO CONVEX
       ====================== */

    const goalNames: Record<string, string> = {
      lose_weight: "Weight Loss",
      build_muscle: "Muscle Building",
      maintain: "Maintenance",
      improve_fitness: "Fitness Improvement",
    };

    const planName = `${goalNames[normalizedUserData.goal ?? "improve_fitness"] ?? "Fitness"} Plan`;

    console.log("💾 Saving plan to Convex:", planName);

    const planId = await convex.mutation(api.plans.createPlan, {
      userId,
      name: planName,
      workoutPlan,
      dietPlan,
      isActive: true,
    });

    console.log("✅ Plan saved with ID:", planId);

    return Response.json({
      success: true,
      planId,
      planName,
      workoutPlan,
      dietPlan,
      usedFallback,
      dailyCalories,
    });

  } catch (error: any) {
    console.error("❌ Generate Plan Error:", error);

    // Even on catastrophic error, try to return a fallback plan
    try {
      const { userId } = await auth();
      if (userId) {
        console.log("🔄 Attempting emergency fallback...");
        
        const emergencyPlan = preGeneratedPlans[0];
        const workoutPlan = normalizeWorkoutPlan(emergencyPlan.workoutPlan as WorkoutPlan);
        const dietPlan = emergencyPlan.dietPlan as DietPlan;

        const planId = await convex.mutation(api.plans.createPlan, {
          userId,
          name: "Fitness Plan",
          workoutPlan,
          dietPlan,
          isActive: true,
        });

        return Response.json({
          success: true,
          planId,
          planName: "Fitness Plan",
          workoutPlan,
          dietPlan,
          usedFallback: true,
          dailyCalories: dietPlan.dailyCalories,
        });
      }
    } catch (fallbackError) {
      console.error("❌ Emergency fallback also failed:", fallbackError);
    }

    return Response.json(
      { error: error.message ?? "Failed to generate plan" },
      { status: 500 }
    );
  }
}