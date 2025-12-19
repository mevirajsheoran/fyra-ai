// convex/plans.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// === MUTATIONS ===

// Create a new plan
export const createPlan = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    workoutPlan: v.object({
      schedule: v.array(v.string()),
      exercises: v.array(
        v.object({
          day: v.string(),
          routines: v.array(
            v.object({
              name: v.string(),
              sets: v.optional(v.number()),
              reps: v.optional(v.number()),
              duration: v.optional(v.string()),
              description: v.optional(v.string()),
              exercises: v.optional(v.array(v.string())),
            })
          ),
        })
      ),
    }),
    dietPlan: v.object({
      dailyCalories: v.number(),
      meals: v.array(
        v.object({
          name: v.string(),
          foods: v.array(v.string()),
        })
      ),
    }),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Deactivate all existing plans for this user
    const existingPlans = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    for (const plan of existingPlans) {
      await ctx.db.patch(plan._id, { isActive: false });
    }

    // Create new plan
    const planId = await ctx.db.insert("plans", {
      userId: args.userId,
      name: args.name,
      workoutPlan: args.workoutPlan,
      dietPlan: args.dietPlan,
      isActive: args.isActive,
    });

    return planId;
  },
});

// Set a plan as active
export const setActivePlan = mutation({
  args: {
    planId: v.id("plans"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify ownership
    const plan = await ctx.db.get(args.planId);
    if (!plan || plan.userId !== args.userId) {
      throw new Error("Plan not found or unauthorized");
    }

    // Deactivate all plans
    const allPlans = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    for (const p of allPlans) {
      await ctx.db.patch(p._id, { isActive: false });
    }

    // Activate selected plan
    await ctx.db.patch(args.planId, { isActive: true });

    return args.planId;
  },
});

// Delete a plan
export const deletePlan = mutation({
  args: {
    planId: v.id("plans"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    
    if (!plan || plan.userId !== args.userId) {
      throw new Error("Plan not found or unauthorized");
    }

    await ctx.db.delete(args.planId);
    return { success: true };
  },
});

// === QUERIES ===

// Get all plans for a user
export const getUserPlans = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get active plan for a user
export const getActivePlan = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
  },
});

// Get a specific plan by ID
export const getPlanById = query({
  args: {
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.planId);
  },
});