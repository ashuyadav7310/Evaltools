import { NextResponse } from "next/server";
import { clearSessions } from "@/lib/session";

export const runtime = "nodejs";

export async function POST() {
  await clearSessions();
  return NextResponse.json({ ok: true, redirectTo: "/login" });
}
