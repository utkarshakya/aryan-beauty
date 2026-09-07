import { Webhook } from "svix";
import { headers } from "next/headers";
import { upsertUserFromClerk, softDeleteUser } from "@/features/auth/server";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: { type: string; data: Record<string, unknown> } | null = null;

  try {
    const verified = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
    evt = verified as unknown as { type: string; data: Record<string, unknown> };
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const { type, data } = evt;

  try {
    switch (type) {
      case "user.created": {
        const clerkUserId = data.id as string;
        const email = (data.email_addresses as Array<{ email_address: string }>)?.[0]?.email_address;
        const name = data.full_name as string | undefined;

        await upsertUserFromClerk(clerkUserId, { email, name, role: "customer" });
        break;
      }

      case "user.updated": {
        const clerkUserId = data.id as string;
        const email = (data.email_addresses as Array<{ email_address: string }>)?.[0]?.email_address;
        const name = data.full_name as string | undefined;

        await upsertUserFromClerk(clerkUserId, { email, name });
        break;
      }

      case "user.deleted": {
        const clerkUserId = data.id as string;
        await softDeleteUser(clerkUserId);
        break;
      }

      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error(`Webhook handler error for ${type}:`, error);
    return new Response("Internal error", { status: 500 });
  }
}
