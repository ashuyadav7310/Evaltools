/**
 * Local API client – replaces the old generated @workspace/api-client-react package.
 * All requests are proxied to the Python FastAPI backend via Vite's dev-server proxy
 * (or served from the same origin in production).
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

const ADMIN_TOKEN_STORAGE_KEY = "convai_admin_key";
const LEGACY_ADMIN_TOKEN_STORAGE_KEY = "trainer_api_key";
const TRAINER_TOKEN_STORAGE_KEY = "convai_trainer_token";
const TRAINER_PROFILE_STORAGE_KEY = "convai_trainer_profile";
const INVITE_TOKEN_STORAGE_KEY = "candidate_invite_token";
const PARTICIPANT_PROFILE_STORAGE_KEY = "convai_participant_profile";

export interface ParticipantProfile {
  name: string;
  email: string;
}

function getAdminToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
    ?? window.localStorage.getItem(LEGACY_ADMIN_TOKEN_STORAGE_KEY)
    ?? "";
}

function getTrainerToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TRAINER_TOKEN_STORAGE_KEY) ?? "";
}

export function hasAdminToken(): boolean {
  return !!getAdminToken().trim();
}

export function hasTrainerSession(): boolean {
  return !!getTrainerToken().trim();
}

export function saveAdminToken(value: string): void {
  if (typeof window === "undefined") return;
  const trimmed = value.trim();
  if (trimmed) {
    window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, trimmed);
  } else {
    window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_ADMIN_TOKEN_STORAGE_KEY);
  }
}

export function clearTrainerSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TRAINER_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(TRAINER_PROFILE_STORAGE_KEY);
}

export async function validateAdminAccess(token?: string): Promise<void> {
  const adminToken = (token ?? getAdminToken()).trim();
  if (!adminToken) {
    throw new Error("Admin access key is required.");
  }

  const res = await fetch(`${API_BASE_PATH}/admin/trainers`, {
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": adminToken,
    },
  });

  if (!res.ok) {
    let message = "Invalid admin access key.";
    try {
      const data = await res.json();
      message = data?.detail ?? data?.error ?? message;
    } catch {
      // Keep the generic validation message when the response is not JSON.
    }
    throw new Error(message);
  }
}

export function getInviteToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(INVITE_TOKEN_STORAGE_KEY) ?? "";
}

export function saveInviteToken(value: string): void {
  if (typeof window === "undefined") return;
  const trimmed = value.trim();
  if (trimmed) {
    window.localStorage.setItem(INVITE_TOKEN_STORAGE_KEY, trimmed);
  } else {
    window.localStorage.removeItem(INVITE_TOKEN_STORAGE_KEY);
  }
}

export function getParticipantProfile(): ParticipantProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PARTICIPANT_PROFILE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ParticipantProfile;
  } catch {
    return null;
  }
}

export function saveParticipantProfile(profile: ParticipantProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PARTICIPANT_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

// ---------------------------------------------------------------------------
// Types (mirror the Python / DB schema)
// ---------------------------------------------------------------------------

export interface Rubric {
  name: string;
  description?: string;
}

export interface Test {
  id: number;
  title: string;
  participantContext: string;
  context: string;
  category: string;
  inputMode: "audio" | "text";
  rounds: number;
  rubrics: Rubric[];
  trainerId?: number | null;
  testCode: string;
  testCodeStatus?: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestInput {
  title: string;
  participantContext: string;
  context: string;
  category: string;
  inputMode: "audio" | "text";
  rounds?: number;
  rubrics: Rubric[];
}

export interface Interview {
  id: number;
  inviteId?: number | null;
  attemptNumber?: number | null;
  testId: number;
  candidateName: string;
  candidateEmail?: string | null;
  status: "pending" | "in_progress" | "completed";
  currentRound: number;
  createdAt: string;
  sessionStartedAt: string | null;
  sessionEndedAt: string | null;
  sessionDurationSeconds: number | null;
  completedAt: string | null;
}

export interface InterviewResponse {
  id: number;
  interviewId: number;
  round: number;
  question: string;
  transcript: string;
  durationSeconds: number | null;
  aiSpeakingDurationSeconds: number | null;
  createdAt: string;
}

export interface InterviewWithResponses extends Interview {
  test: Test | null;
  responses: InterviewResponse[];
}

export interface ScoreBreakdown {
  criterion: string;
  score: number;
  maxScore: number;
  justification: string;
}

export interface Report {
  id: number;
  interviewId: number;
  testId: number | null;
  candidateName: string;
  testTitle: string;
  totalScore: number;
  maxScore: number;
  scoreBreakdown: ScoreBreakdown[];
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  overallJustification: string;
  timeSpentSeconds: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface QuestionResponse {
  question: string;
  round: number;
  isComplete: boolean;
}

export interface ProcessTurnResponse {
  transcript: string;
  interviewerQuestion?: string;
  question: string;
  round: number;
  isComplete: boolean;
}

export interface Invite {
  id: number;
  testId: number;
  candidateName: string | null;
  maxAttempts: number;
  usedAttempts: number;
  expiresAt: string | null;
  status: "issued" | "started" | "completed" | "expired";
  createdAt: string;
  updatedAt: string;
}

export interface InviteValidation {
  invite: Invite;
  test: Pick<Test, "id" | "title" | "participantContext" | "category" | "inputMode" | "rounds">;
  activeInterview: Interview | null;
  canStartNew: boolean;
  remainingAttempts: number;
}

export interface TrainerAccount {
  id: number;
  email: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface TrainerLoginResponse {
  token: string;
  trainer: TrainerAccount;
}

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

type ApiFetchOptions = {
  authMode?: "trainer" | "admin" | "none";
  includeTrainerAuth?: boolean;
  includeInviteAuth?: boolean;
  inviteToken?: string;
};

const API_BASE_PATH = "/api/convai";

async function apiFetch<T>(url: string, init?: RequestInit, options?: ApiFetchOptions): Promise<T> {
  const authMode = options?.authMode ?? (options?.includeTrainerAuth === false ? "none" : "trainer");
  const includeInviteAuth = options?.includeInviteAuth ?? false;
  const adminToken = authMode === "admin" ? getAdminToken() : "";
  const trainerToken = authMode === "trainer" ? getTrainerToken() : "";
  const inviteToken = (options?.inviteToken ?? getInviteToken()).trim();
  const authHeaders: Record<string, string> = {};
  if (adminToken) {
    authHeaders["X-Admin-Token"] = adminToken;
  }
  if (trainerToken) {
    authHeaders["X-Trainer-Token"] = trainerToken;
  }
  if (includeInviteAuth && inviteToken) {
    authHeaders["X-Invite-Token"] = inviteToken;
  }

  const requestUrl = url.startsWith("/api")
    ? `${API_BASE_PATH}${url.slice("/api".length)}`
    : url;
  const res = await fetch(requestUrl, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get("content-type") || "";
  const body = await res.text();
  let data: unknown = null;
  if (body && contentType.includes("application/json")) {
    try {
      data = JSON.parse(body);
    } catch {
      data = null;
    }
  }
  if (!res.ok) {
    const payload = data as { detail?: string; error?: string } | null;
    throw new Error(payload?.detail ?? payload?.error ?? (body || `${res.status} ${res.statusText}`));
  }
  return data as T;
}

// ---------------------------------------------------------------------------
// Query key helpers (for cache invalidation)
// ---------------------------------------------------------------------------

export const getListTestsQueryKey = () => ["/api/tests"] as const;
export const getListInterviewsQueryKey = () => ["/api/interviews"] as const;
export const getInterviewQueryKey = (id: number) => ["/api/interviews", id] as const;
export const getReportQueryKey = (id: number) => ["/api/reports", id] as const;
export const getListReportsQueryKey = (testId?: number) => ["/api/reports", { testId: testId ?? null }] as const;
export const getTestQueryKey = (id: number) => ["/api/tests", id] as const;
export const getListTrainersQueryKey = () => ["/api/admin/trainers"] as const;

export function getStoredTrainer(): TrainerAccount | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(TRAINER_PROFILE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TrainerAccount;
  } catch {
    return null;
  }
}

export async function trainerLogin(data: { email: string; password: string }): Promise<TrainerLoginResponse> {
  const result = await apiFetch<TrainerLoginResponse>(
    "/api/auth/trainer/login",
    { method: "POST", body: JSON.stringify(data) },
    { authMode: "none" },
  );
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TRAINER_TOKEN_STORAGE_KEY, result.token);
    window.localStorage.setItem(TRAINER_PROFILE_STORAGE_KEY, JSON.stringify(result.trainer));
  }
  return result;
}

export async function validateTrainerSession(): Promise<void> {
  if (!getTrainerToken()) {
    throw new Error("Trainer login is required.");
  }
  await apiFetch("/api/auth/trainer/me", undefined, { authMode: "trainer" });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

export function useListTests(requireTrainerAuth = false): UseQueryResult<Test[]> {
  return useQuery({
    queryKey: getListTestsQueryKey(),
    queryFn: () => apiFetch<Test[]>("/api/tests"),
    enabled: !requireTrainerAuth || hasTrainerSession() || hasAdminToken(),
  });
}

export function useGetTest(id: number): UseQueryResult<Test> {
  return useQuery({
    queryKey: getTestQueryKey(id),
    queryFn: () => apiFetch<Test>(`/api/tests/${id}`),
    enabled: !!id,
  });
}

export function useCreateTest(): UseMutationResult<Test, Error, { data: CreateTestInput }> {
  return useMutation({
    mutationFn: ({ data }) =>
      apiFetch<Test>("/api/tests", { method: "POST", body: JSON.stringify(data) }),
  });
}

export function useDeleteTest(): UseMutationResult<void, Error, { id: number }> {
  return useMutation({
    mutationFn: ({ id }) => apiFetch<void>(`/api/tests/${id}`, { method: "DELETE" }),
  });
}

export function useCreateInvite(): UseMutationResult<
  Invite & { inviteToken: string; joinUrl: string },
  Error,
  { data: { testId: number; candidateName?: string; maxAttempts?: number; expiresAt?: string } }
> {
  return useMutation({
    mutationFn: ({ data }) =>
      apiFetch<Invite & { inviteToken: string; joinUrl: string }>("/api/invites", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useListInvites(testId?: number): UseQueryResult<Invite[]> {
  const qs = typeof testId === "number" ? `?testId=${testId}` : "";
  return useQuery({
    queryKey: ["/api/invites", { testId: testId ?? null }],
    queryFn: () => apiFetch<Invite[]>(`/api/invites${qs}`),
  });
}

export function useValidateInvite(inviteToken: string): UseQueryResult<InviteValidation> {
  return useQuery({
    queryKey: ["/api/join", inviteToken],
    queryFn: () => apiFetch<InviteValidation>(`/api/join/${encodeURIComponent(inviteToken)}`, undefined, { authMode: "none" }),
    enabled: !!inviteToken,
  });
}

export async function validateInviteCode(inviteToken: string): Promise<InviteValidation> {
  return apiFetch<InviteValidation>(`/api/join/${encodeURIComponent(inviteToken)}`, undefined, {
    authMode: "none",
    inviteToken,
  });
}

export function useStartInviteInterview(): UseMutationResult<
  { interview: Interview; resumed: boolean },
  Error,
  { inviteToken: string; data: { candidateName?: string; candidateEmail?: string } }
> {
  return useMutation({
    mutationFn: ({ inviteToken, data }) =>
      apiFetch<{ interview: Interview; resumed: boolean }>(
        `/api/join/${encodeURIComponent(inviteToken)}/start`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
        { authMode: "none" },
      ),
  });
}

// ---------------------------------------------------------------------------
// Interviews
// ---------------------------------------------------------------------------

export function useListInterviews(requireTrainerAuth = false): UseQueryResult<Interview[]> {
  return useQuery({
    queryKey: getListInterviewsQueryKey(),
    queryFn: () => apiFetch<Interview[]>("/api/interviews"),
    enabled: !requireTrainerAuth || hasTrainerSession() || hasAdminToken(),
  });
}

export function useGetInterview(id: number): UseQueryResult<InterviewWithResponses> {
  return useQuery({
    queryKey: getInterviewQueryKey(id),
    queryFn: () => apiFetch<InterviewWithResponses>(`/api/interviews/${id}`, undefined, { includeInviteAuth: true }),
    enabled: !!id,
  });
}

export function useCreateInterview(): UseMutationResult<
  Interview,
  Error,
  { data: { testId: number; candidateName: string; candidateEmail?: string } }
> {
  return useMutation({
    mutationFn: ({ data }) =>
      apiFetch<Interview>("/api/interviews", { method: "POST", body: JSON.stringify(data) }),
  });
}

export function useGetNextQuestion(): UseMutationResult<
  QuestionResponse,
  Error,
  { id: number; data: { candidateResponse: string | null; lastQuestion?: string; responseRound?: number } }
> {
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiFetch<QuestionResponse>(`/api/interviews/${id}/next-question`, {
        method: "POST",
        body: JSON.stringify(data),
      }, { includeInviteAuth: true }),
  });
}

export function useSubmitResponse(): UseMutationResult<
  InterviewResponse,
  Error,
  { id: number; data: { round: number; question: string; transcript: string; responseDurationSeconds?: number; aiSpeakingDurationSeconds?: number } }
> {
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiFetch<InterviewResponse>(`/api/interviews/${id}/responses`, {
        method: "POST",
        body: JSON.stringify(data),
      }, { includeInviteAuth: true }),
  });
}

export function useTranscribeAudio(): UseMutationResult<
  { transcript: string },
  Error,
  { id: number; data: { audio: string; mimeType?: string } }
> {
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiFetch<{ transcript: string }>(`/api/interviews/${id}/transcribe`, {
        method: "POST",
        body: JSON.stringify(data),
      }, { includeInviteAuth: true }),
  });
}

export function useTextToSpeech(): UseMutationResult<
  { audio: string; format: string },
  Error,
  { id: number; data: { text: string } }
> {
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiFetch<{ audio: string; format: string }>(`/api/interviews/${id}/tts`, {
        method: "POST",
        body: JSON.stringify(data),
      }, { includeInviteAuth: true }),
  });
}

export function useProcessTurn(): UseMutationResult<
  ProcessTurnResponse,
  Error,
  { id: number; data: { audio: string; mimeType?: string; question: string; round: number; responseDurationSeconds?: number; aiSpeakingDurationSeconds?: number } }
> {
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiFetch<ProcessTurnResponse>(`/api/interviews/${id}/process-turn`, {
        method: "POST",
        body: JSON.stringify(data),
      }, { includeInviteAuth: true }),
  });
}

export function useProcessTextTurn(): UseMutationResult<
  ProcessTurnResponse,
  Error,
  { id: number; data: { transcript: string; question: string; round: number; responseDurationSeconds?: number; aiSpeakingDurationSeconds?: number } }
> {
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiFetch<ProcessTurnResponse>(`/api/interviews/${id}/process-text-turn`, {
        method: "POST",
        body: JSON.stringify(data),
      }, { includeInviteAuth: true }),
  });
}

export function useEndSession(): UseMutationResult<Interview, Error, { id: number }> {
  return useMutation({
    mutationFn: ({ id }) =>
      apiFetch<Interview>(`/api/interviews/${id}/end-session`, { method: "POST" }, { includeInviteAuth: true }),
  });
}

export function useCompleteInterview(): UseMutationResult<Interview, Error, { id: number }> {
  return useEndSession();
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export function useGetReport(interviewId: number): UseQueryResult<Report> {
  return useQuery({
    queryKey: getReportQueryKey(interviewId),
    queryFn: () => apiFetch<Report>(`/api/reports/${interviewId}`),
    enabled: !!interviewId && (hasTrainerSession() || hasAdminToken()),
  });
}

export function useListReports(testId?: number): UseQueryResult<Report[]> {
  return useQuery({
    queryKey: getListReportsQueryKey(testId),
    queryFn: () => apiFetch<Report[]>(testId ? `/api/reports?testId=${testId}` : "/api/reports"),
    enabled: hasTrainerSession() || hasAdminToken(),
  });
}

export function useListTrainers(): UseQueryResult<TrainerAccount[]> {
  return useQuery({
    queryKey: getListTrainersQueryKey(),
    queryFn: () => apiFetch<TrainerAccount[]>("/api/admin/trainers", undefined, { authMode: "admin" }),
    enabled: hasAdminToken(),
  });
}

export function useCreateTrainer(): UseMutationResult<TrainerAccount, Error, { data: { email: string; password: string } }> {
  return useMutation({
    mutationFn: ({ data }) =>
      apiFetch<TrainerAccount>(
        "/api/admin/trainers",
        { method: "POST", body: JSON.stringify(data) },
        { authMode: "admin" },
      ),
  });
}

export function useUpdateTrainer(): UseMutationResult<TrainerAccount, Error, { id: number; data: { password?: string; status?: "active" | "inactive" } }> {
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiFetch<TrainerAccount>(
        `/api/admin/trainers/${id}`,
        { method: "PATCH", body: JSON.stringify(data) },
        { authMode: "admin" },
      ),
  });
}

export function useUpdateTestStatus(): UseMutationResult<Test, Error, { id: number; status: "active" | "inactive" }> {
  return useMutation({
    mutationFn: ({ id, status }) =>
      apiFetch<Test>(`/api/tests/${id}`, {
        method: "PUT",
        body: JSON.stringify({ testCodeStatus: status }),
      }),
  });
}
