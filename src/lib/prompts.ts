import { UserHealthData } from "@/types/voice-assistant";

/* ======================
   CONVERSATION PROMPT
   ====================== */

export const SYSTEM_PROMPT = `
You are a fitness assistant collecting user information.

STRICT RULES:
- Do NOT introduce yourself
- Do NOT greet
- Do NOT acknowledge answers
- Ask ONLY the given question
- One response = one question
- Max 25 words
- No emojis
- No explanations
- No follow-up text

Conversation so far:
{conversation}

Ask this question exactly:
{question}
`;

/* ======================
   DATA EXTRACTION PROMPT
   ====================== */

export const DATA_EXTRACTION_PROMPT = `Extract fitness data from this conversation.

Conversation:
{conversation}

Return ONLY valid JSON:
{
  "name": string | null,
  "age": number | null,
  "weight": number | null,
  "height": number | null,
  "gender": "male" | "female" | "other" | null,
  "goal": "lose_weight" | "build_muscle" | "maintain" | "improve_fitness" | null,
  "activityLevel": "sedentary" | "light" | "moderate" | "active" | "very_active" | null,
  "experienceLevel": "beginner" | "intermediate" | "advanced" | null,
  "workoutPreference": "home" | "gym" | "outdoor" | null,
  "daysPerWeek": number | null,
  "dietaryRestrictions": string[],
  "healthConditions": string[]
}

Rules:
- Numbers must be numbers
- Use null if missing
- No text outside JSON`;

/* ======================
   WORKOUT PROMPT
   ====================== */

export function createWorkoutPrompt(data: UserHealthData): string {
  return `Create a SIMPLE workout plan.

User:
- Goal: ${data.goal}
- Experience: ${data.experienceLevel}
- Location: ${data.workoutPreference}
- Days per week: ${data.daysPerWeek}
- Health conditions: ${data.healthConditions.join(", ") || "none"}

Return ONLY JSON:
{
  "schedule": ["Monday", "Wednesday", "Friday"],
  "exercises": [
    {
      "day": "Monday",
      "routines": [
        {
          "name": "Exercise name",
          "sets": 3,
          "reps": 12,
          "description": "Short form cue"
        }
      ]
    }
  ]
}

Rules:
- Use ${data.daysPerWeek} days ONLY
- 3–5 exercises per day
- sets and reps MUST be numbers
- Keep descriptions under 8 words
- No extra fields
- No markdown`;
}

/* ======================
   DIET PROMPT
   ====================== */

export function createDietPrompt(
  data: UserHealthData,
  dailyCalories: number
): string {
  return `Create a SIMPLE daily meal plan.

Daily calories: ${dailyCalories}
Dietary restrictions: ${data.dietaryRestrictions.join(", ") || "none"}

Return ONLY JSON:
{
  "dailyCalories": ${dailyCalories},
  "meals": [
    {
      "name": "Breakfast",
      "foods": ["Food item", "Food item"]
    }
  ]
}

Rules:
- 4–5 meals total
- Foods must be common, simple items
- Respect dietary restrictions
- No extra fields
- No explanations
- No markdown`;
}
