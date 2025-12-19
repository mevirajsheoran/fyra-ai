// convex/http.ts

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";

const http = httpRouter();

/**
 * Clerk Webhook Handler
 * Responsibility:
 * - Verify webhook signature
 * - Sync user data into Convex
 * - NOTHING else
 */
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Missing CLERK_WEBHOOK_SECRET");
      return new Response("Server misconfigured", { status: 500 });
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("Missing Svix headers", { status: 400 });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let event: WebhookEvent;

    try {
      event = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Webhook verification failed", err);
      return new Response("Invalid signature", { status: 400 });
    }

    // ---- USER CREATED ----
    if (event.type === "user.created") {
      const { id, first_name, last_name, image_url, email_addresses } =
        event.data;

      const email = email_addresses?.[0]?.email_address;
      const name = `${first_name ?? ""} ${last_name ?? ""}`.trim();

      if (!email) {
        return new Response("Missing email", { status: 400 });
      }

      await ctx.runMutation(api.users.syncUser, {
        clerkId: id,
        email,
        name,
        image: image_url,
      });
    }

    // ---- USER UPDATED ----
    if (event.type === "user.updated") {
      const { id, first_name, last_name, image_url, email_addresses } =
        event.data;

      const email = email_addresses?.[0]?.email_address;
      const name = `${first_name ?? ""} ${last_name ?? ""}`.trim();

      if (!email) {
        return new Response("Missing email", { status: 400 });
      }

      await ctx.runMutation(api.users.updateUser, {
        clerkId: id,
        email,
        name,
        image: image_url,
      });
    }

    return new Response("Webhook processed", { status: 200 });
  }),
});

export default http;
