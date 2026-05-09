// ============================================================
// authApi.ts — Centralized API Layer for Authentication
// Applies: Single Responsibility, Dependency Inversion (SOLID)
// No axios — uses native fetch consistent with the rest of the app
// ============================================================

const BASE = import.meta.env.VITE_API_URL || "/api";

// ─── Generic helper ───────────────────────────────────────────

async function authFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

// ─── Auth endpoints ───────────────────────────────────────────

export const login = (email: string, password: string) =>
  authFetch<{ token: string; user: any }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const signUp = (body: {
  full_name: string;
  email: string;
  password: string;
  role: string;
  job_title?: string;
  expertise?: string;
  linkedin?: string;
}) =>
  authFetch<{ message: string }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const googleAuth = (idToken: string, role?: string) =>
  authFetch<{ token: string; user: any }>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken, role }),
  });

export const verifyEmail = (email: string, code: string) =>
  authFetch<{ token: string; user: any }>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });

export const resendVerification = (email: string) =>
  authFetch<{ message: string }>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const forgotPassword = (email: string) =>
  authFetch<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const verifyResetCode = (email: string, code: string) =>
  authFetch<{ message: string }>("/auth/verify-reset", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });

export const resetPassword = (email: string, code: string, newPassword: string) =>
  authFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, code, new_password: newPassword }),
  });