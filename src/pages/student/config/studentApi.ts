// ============================================================
// studentApi.ts — Centralized API Layer for Student Panel
// Applies: Single Responsibility, Dependency Inversion (SOLID)
// ============================================================

const getAuthHeader = (): Record<string, string> => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

const jsonHeaders = (): Record<string, string> => ({
  ...getAuthHeader(),
  "Content-Type": "application/json",
});

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { ...(options?.headers ?? {}), ...getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

async function apiPost<T>(url: string, body: object): Promise<T> {
  return apiFetch<T>(url, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
}

async function apiPatch<T>(url: string, body?: object): Promise<T> {
  return apiFetch<T>(url, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function apiPut<T>(url: string, body: object | FormData): Promise<T> {
  const isForm = body instanceof FormData;
  return apiFetch<T>(url, {
    method: "PUT",
    headers: isForm ? getAuthHeader() : jsonHeaders(),
    body: isForm ? body : JSON.stringify(body),
  });
}

async function apiDelete<T>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: "DELETE", headers: getAuthHeader() });
}

// ─── Profile ────────────────────────────────────────────────

export const fetchMe = () => apiFetch("/api/me");

export const fetchMyStats = () => apiFetch("/api/me/stats");

export const fetchMyCourses = () => apiFetch("/api/me/my-courses");

export const updateBio = (bio: string) =>
  apiPut("/api/me", { bio });

export const updateProfileImage = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return apiPut("/api/me/profile-image", form);
};

// ─── Courses ────────────────────────────────────────────────

export const fetchAllCourses = () => apiFetch("/api/courses");

export const fetchCourseById = (courseId: number) =>
  apiFetch(`/api/courses/${courseId}`);

export const fetchCourseVideos = (courseId: number) =>
  apiFetch(`/api/courses/${courseId}/videos`);

export const fetchCourseVideosPreview = (courseId: number) =>
  apiFetch(`/api/courses/${courseId}/videos-preview`);

export const enrollInCourse = (courseId: number) =>
  apiPost(`/api/courses/${courseId}/enroll`, {});

export const fetchCourseProgress = (courseId: number) =>
  apiFetch(`/api/courses/${courseId}/progress`);

export const fetchVideosProgress = (courseId: number) =>
  apiFetch(`/api/courses/${courseId}/videos/progress`);

export const sendVideoProgress = (videoId: number, currentTime: number) =>
  apiPost(`/api/videos/${videoId}/progress`, { current_time: currentTime });

// ─── Notes ──────────────────────────────────────────────────

export const fetchVideoNotes = (videoId: number) =>
  apiFetch(`/api/videos/${videoId}/notes`);

export const addVideoNote = (videoId: number, content: string, videoTimestamp: number) =>
  apiPost(`/api/videos/${videoId}/notes`, { content, video_timestamp: videoTimestamp });

export const deleteNote = (noteId: number) =>
  apiDelete(`/api/notes/${noteId}`);

// ─── Assignments ─────────────────────────────────────────────

export const fetchAllAssignments = () =>
  apiFetch("/api/assignments/student/all");

export const fetchAssignmentById = (assignmentId: number) =>
  apiFetch(`/api/assignments/student/${assignmentId}`);

export const submitAssignment = (assignmentId: number, answers: any[]) =>
  apiPost(`/api/assignments/${assignmentId}/submit`, { answers });

export const fetchAssignmentAttempts = (assignmentId: number) =>
  apiFetch(`/api/assignments/${assignmentId}/attempts`);

export const fetchAttemptDetails = (assignmentId: number, attemptId: number) =>
  apiFetch(`/api/assignments/${assignmentId}/attempts/${attemptId}`);

// ─── Certificates ────────────────────────────────────────────

export const fetchMyCertificates = () => apiFetch("/api/certificates/my");

// ─── Notifications ───────────────────────────────────────────

export const fetchNotifications = () => apiFetch("/api/notifications");

export const markNotificationRead = (id: number) =>
  apiPatch(`/api/notifications/${id}/read`);

// ─── Roadmaps ────────────────────────────────────────────────

export const fetchRoadmaps = () => apiFetch("/api/roadmaps");

export const startRoadmap = (roadmapId: number) =>
  apiPost(`/api/roadmaps/${roadmapId}/start`, {});

export const fetchStepDetails = (stepId: number) =>
  apiFetch(`/api/steps/${stepId}`);

export const completeStep = (stepId: number) =>
  apiPost(`/api/steps/${stepId}/complete`, {});

// ─── Compiler ────────────────────────────────────────────────

export const runCode = (sourceCode: string, language: string, stdin = "") =>
  apiPost("/api/compiler/run", { source_code: sourceCode, language, stdin });

// ─── Contact ─────────────────────────────────────────────────

export const sendContactMessage = (body: {
  full_name: string;
  email: string;
  category: string;
  message: string;
}) => apiPost("/api/contact", body);

// ─── Settings ────────────────────────────────────────────────

export const changePassword = (currentPassword: string, newPassword: string) =>
  apiPost("/api/auth/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });