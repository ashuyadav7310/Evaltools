import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const adminKey = String(body?.adminKey || "");
  const expectedKey = process.env.trainer_api_key;

  if (!expectedKey) {
    return NextResponse.json({ error: "Admin key is not configured." }, { status: 500 });
  }

  if (adminKey !== expectedKey) {
    return NextResponse.json({ error: "UNAUTHORIZED ACCESS" }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true, redirectTo: "/admin-dashboard" });
}
