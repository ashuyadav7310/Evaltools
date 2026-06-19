import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { createUser, listUsers } from "@/lib/users";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED ACCESS" }, { status: 401 });
  }

  return NextResponse.json({ users: await listUsers() });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED ACCESS" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const email = String(body?.email || "");
  const password = String(body?.password || "");

  try {
    const user = await createUser(email, password);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create user." },
      { status: 400 }
    );
  }
}
