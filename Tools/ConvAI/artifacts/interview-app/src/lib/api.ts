/**
 * Local API client – replaces the old generated @workspace/api-client-react package.
 * All requests are proxied to the Python FastAPI backend via Vite's dev-server proxy
 * (or served from the same origin in production).
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

const TRAINER_TOKEN_STORAGE_KEY = "trainer_api_key";
const INVITE_TOKEN_STORAGE_KEY = "candidate_invite_token";

function getTrainerApiKey(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TRAINER_TOKEN_STORAGE_KEY) ?? "";
}

export function hasTrainerApiKey(): boolean {
  return !!getTrainerApiKey().trim();
}

export function saveTrainerApiKey(value: string): void {
  if (typeof window === "undefined") return;
  const trimmed = value.trim();
  if (trimmed) {
    window.localStorage.setItem(TRAINER_TOKEN_STORAGE_KEY, trimmed);
  } else {
    window.localStorage.removeItem(TRAINER_TOKEN_STORAGE_KEY);
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

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

type ApiFetchOptions = {
  includeTrainerAuth?: boolean;
  includeInviteAuth?: boolean;
  inviteToken?: string;
};

const API_BASE_PATH = "/api/convai";

async function apiFetch<T>(url: string, init?: RequestInit, options?: ApiFetchOptions): Promise<T> {
  const includeTrainerAuth = options?.includeTrainerAuth ?? true;
  const includeInviteAuth = options?.includeInviteAuth ?? false;
  const trainerApiKey = includeTrainerAuth ? getTrainerApiKey() : "";
  const inviteToken = (options?.inviteToken ?? getInviteToken()).trim();
  const authHeaders: Record<string, string> = {};
  if (trainerApiKey) {
    authHeaders["X-Admin-Token"] = trainerApiKey;
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
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail ?? data?.error ?? "API error");
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

export function useListTests(requireTrainerAuth = false): UseQueryResult<Test[]> {
  return useQuery({
    queryKey: getListTestsQueryKey(),
    queryFn: () => apiFetch<Test[]>("/api/tests"),
    enabled: !requireTrainerAuth || hasTrainerApiKey(),
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
    queryFn: () => apiFetch<InviteValidation>(`/api/join/${encodeURIComponent(inviteToken)}`, undefined, {
      includeTrainerAuth: false,
    }),
    enabled: !!inviteToken,
  });
}

export function useStartInviteInterview(): UseMutationResult<
  { interview: Interview; resumed: boolean },
  Error,
  { inviteToken: string; data: { candidateName?: string } }
> {
  return useMutation({
    mutationFn: ({ inviteToken, data }) =>
      apiFetch<{ interview: Interview; resumed: boolean }>(
        `/api/join/${encodeURIComponent(inviteToken)}/start`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
        { includeTrainerAuth: false },
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
    enabled: !requireTrainerAuth || hasTrainerApiKey(),
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
  { data: { testId: number; candidateName: string } }
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
    enabled: !!interviewId && hasTrainerApiKey(),
  });
}

export function useListReports(testId?: number): UseQueryResult<Report[]> {
  return useQuery({
    queryKey: getListReportsQueryKey(testId),
    queryFn: () => apiFetch<Report[]>(testId ? `/api/reports?testId=${testId}` : "/api/reports"),
    enabled: hasTrainerApiKey(),
  });
}
