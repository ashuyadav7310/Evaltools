import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { PublicUser } from "./users";

const USER_COOKIE = "evalai_user_session";
const ADMIN_COOKIE = "evalai_admin_session";

type SessionRole = "user" | "admin";

type SessionPayload = {
  role: SessionRole;
  sub: string;
  email?: string;
  exp: number;
};

function secret() {
  return process.env.EVALAI_SESSION_SECRET || process.env.trainer_api_key || "evalai-local-session-secret";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function encode(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token?: string): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const expected = sign(body);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
  return payload.exp > Date.now() ? payload : null;
}

export async function createUserSession(user: PublicUser) {
  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE, encode({
    role: "user",
    sub: user.id,
    email: user.email,
    exp: Date.now() + 1000 * 60 * 60 * 8
  }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, encode({
    role: "admin",
    sub: "admin",
    exp: Date.now() + 1000 * 60 * 60 * 2
  }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 2
  });
}

export async function getUserSession() {
  const cookieStore = await cookies();
  const payload = decode(cookieStore.get(USER_COOKIE)?.value);
  return payload?.role === "user" ? payload : null;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const payload = decode(cookieStore.get(ADMIN_COOKIE)?.value);
  return payload?.role === "admin" ? payload : null;
}

export async function clearSessions() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE);
  cookieStore.delete(ADMIN_COOKIE);
}
