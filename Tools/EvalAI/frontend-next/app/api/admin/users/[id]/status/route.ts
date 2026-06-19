import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { setUserStatus } from "@/lib/users";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED ACCESS" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = String(body?.status || "");

  try {
    const user = await setUserStatus(id, status === "active" ? "active" : "inactive");
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update user." },
      { status: 400 }
    );
  }
}
