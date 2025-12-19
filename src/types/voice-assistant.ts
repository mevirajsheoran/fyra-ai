// src/types/voice-assistant.ts

/* =========================
   CHAT & CONVERSATION
   ========================= */

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ConversationState {
  messages: Message[];
  collectedData: UserHealthData;
  isComplete: boolean;
  turnNumber: number; // 1 → 3 (hard capped)
}

export type VoiceStatus =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "generating";

/* =========================
   USER HEALTH DATA
   ========================= */

export interface UserHealthData {
  name: string | null;
  age: number | null;
  gender: "male" | "female" | "other" | null;

  // Normalized units
  weight: number | null; // kg
  height: number | null; // cm

  goal:
    | "lose_weight"
    | "build_muscle"
    | "maintain"
    | "improve_fitness"
    | null;

  activityLevel:
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "very_active"
    | null;

  experienceLevel:
    | "beginner"
    | "intermediate"
    | "advanced"
    | null;

  workoutPreference:
    | "home"
    | "gym"
    | "outdoor"
    | null;

  daysPerWeek: number | null; // 1–7

  dietaryRestrictions: string[]; // e.g. ["vegetarian", "no dairy"]
  healthConditions: string[]; // e.g. ["knee pain"]
}

/* =========================
   GENERATED FITNESS PLAN
   ========================= */

export interface WorkoutRoutine {
  name: string;
  sets: number; // ALWAYS numeric (Convex-safe)
  reps: number; // ALWAYS numeric (Convex-safe)
  description?: string;
}

export interface WorkoutDay {
  day: string;
  routines: WorkoutRoutine[];
}

export interface WorkoutPlan {
  schedule: string[]; // e.g. ["Monday", "Wednesday", "Friday"]
  exercises: WorkoutDay[];
}

export interface DietMeal {
  name: string;
  foods: string[];
}

export interface DietPlan {
  dailyCalories: number; // calculated in code, NOT by LLM
  meals: DietMeal[];
}

/* =========================
   COMBINED PLAN (API OUTPUT)
   ========================= */

export interface CombinedFitnessPlan {
  workoutPlan: WorkoutPlan;
  dietPlan: DietPlan;
}
