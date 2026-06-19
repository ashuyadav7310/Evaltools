import { NextResponse } from "next/server";
import { createUserSession } from "@/lib/session";
import { authenticateUser } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email || "");
  const password = String(body?.password || "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const result = await authenticateUser(email, password);
  if (!result.ok) {
    const message =
      result.reason === "INACTIVE_ACCOUNT"
        ? "This account is inactive. Contact your administrator."
        : "Invalid email or password.";
    return NextResponse.json({ error: message }, { status: 401 });
  }

  await createUserSession(result.user);
  return NextResponse.json({ ok: true, redirectTo: "/evalai" });
}
