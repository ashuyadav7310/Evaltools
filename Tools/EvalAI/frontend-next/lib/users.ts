import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "./passwords";
import { isValidEmail, normalizeEmail, validatePassword } from "./validation";

export type UserStatus = "active" | "inactive";

export type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
  status: UserStatus;
  createdAt: string;
};

export type PublicUser = Omit<StoredUser, "passwordHash">;

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, "[]\n", "utf8");
  }
}

async function readUsers(): Promise<StoredUser[]> {
  await ensureStore();
  const file = await fs.readFile(USERS_FILE, "utf8");
  return JSON.parse(file) as StoredUser[];
}

async function writeUsers(users: StoredUser[]) {
  await ensureStore();
  await fs.writeFile(USERS_FILE, `${JSON.stringify(users, null, 2)}\n`, "utf8");
}

function toPublicUser(user: StoredUser): PublicUser {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function listUsers() {
  const users = await readUsers();
  return users.map(toPublicUser).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createUser(emailInput: string, password: string) {
  const email = normalizeEmail(emailInput);

  if (!isValidEmail(email)) {
    throw new Error("Enter a valid email address.");
  }

  if (!validatePassword(password)) {
    throw new Error("Password must be at least 8 characters.");
  }

  const users = await readUsers();
  if (users.some((user) => user.email === email)) {
    throw new Error("A user with this email already exists.");
  }

  const user: StoredUser = {
    id: randomUUID(),
    email,
    passwordHash: await hashPassword(password),
    status: "active",
    createdAt: new Date().toISOString()
  };

  users.push(user);
  await writeUsers(users);
  return toPublicUser(user);
}

export async function authenticateUser(emailInput: string, password: string) {
  const email = normalizeEmail(emailInput);
  const users = await readUsers();
  const user = users.find((item) => item.email === email);

  if (!user) {
    return { ok: false as const, reason: "INVALID_CREDENTIALS" as const };
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches) {
    return { ok: false as const, reason: "INVALID_CREDENTIALS" as const };
  }

  if (user.status !== "active") {
    return { ok: false as const, reason: "INACTIVE_ACCOUNT" as const };
  }

  return { ok: true as const, user: toPublicUser(user) };
}

export async function setUserStatus(userId: string, status: UserStatus) {
  if (status !== "active" && status !== "inactive") {
    throw new Error("Invalid status.");
  }

  const users = await readUsers();
  const user = users.find((item) => item.id === userId);
  if (!user) {
    throw new Error("User not found.");
  }

  user.status = status;
  await writeUsers(users);
  return toPublicUser(user);
}
