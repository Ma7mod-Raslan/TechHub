// ============================================================
// instructorApi.ts — Centralized API Layer for Instructor Panel
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
  return apiFetch<T>(url, { method: "POST", headers: jsonHeaders(), body: JSON.stringify(body) });
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

async function apiPatch<T>(url: string, body?: object): Promise<T> {
  return apiFetch<T>(url, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ─── Dashboard / Stats ───────────────────────────────────────

export const fetchInstructorStats = () =>
  apiFetch("/api/instructor/stats");

// ─── Profile ────────────────────────────────────────────────

export const fetchMe = () => apiFetch("/api/me");

export const updateMe = (body: { full_name?: string; bio?: string; linkedin?: string; expertise?: string[] }) =>
  apiPut("/api/me", body);

export const updateProfileImage = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return apiPut("/api/me/profile-image", form);
};

// ─── Courses ────────────────────────────────────────────────

export const fetchInstructorCourses = () =>
  apiFetch("/api/courses/instructor");

export const fetchCourseById = (courseId: number) =>
  apiFetch(`/api/courses/${courseId}`);

export const deleteCourse = (courseId: number) =>
  apiDelete(`/api/courses/${courseId}`);

export const updateCourse = (courseId: number, body: object) =>
  apiPut(`/api/courses/${courseId}`, body);

export const publishCourse = (courseId: number) =>
  apiFetch(`/api/courses/${courseId}/publish`, { method: "PUT", headers: getAuthHeader() });

export const updateCourseThumbnail = (courseId: number, file: File) => {
  const form = new FormData();
  form.append("file", file);
  return apiPut(`/api/courses/${courseId}/thumbnail`, form);
};

export const updateCourseOutcomes = (courseId: number, items: string[]) =>
  apiPut(`/api/courses/${courseId}/outcomes`, { items });

export const updateCourseRequirements = (courseId: number, items: string[]) =>
  apiPut(`/api/courses/${courseId}/requirements`, { items });

// ─── Videos ─────────────────────────────────────────────────

export const fetchCourseVideos = (courseId: number) =>
  apiFetch(`/api/courses/${courseId}/videos`);

export const addVideo = (courseId: number, body: { title: string; video_url: string; description: string; video_order: number }) =>
  apiPost(`/api/courses/${courseId}/videos`, body);

export const updateVideo = (courseId: number, videoId: number, body: object) =>
  apiPut(`/api/courses/${courseId}/videos/${videoId}`, body);

export const deleteVideo = (courseId: number, videoId: number) =>
  apiDelete(`/api/courses/${courseId}/videos/${videoId}`);

export const reorderVideos = (courseId: number, videoId: number, targetVideoId: number) =>
  apiPut(`/api/courses/${courseId}/videos/reorder`, { videoId, targetVideoId });

// ─── Video Questions (MCQ) ───────────────────────────────────

export const fetchVideoQuestions = (videoId: number) =>
  apiFetch(`/api/videos/${videoId}/questions`);

export const addVideoQuestion = (videoId: number, questionText: string, choices: any[]) =>
  apiPost(`/api/videos/${videoId}/questions`, { question_text: questionText, choices });

// ─── Assessments ─────────────────────────────────────────────

export const createAssignment = (body: {
  course_id: number;
  title: string;
  description: null;
  passing_percentage: number;
  max_attempts: number | null;
}) => apiPost("/api/assignments", body);

export const fetchAssignment = (assignmentId: string | number) =>
  apiFetch(`/api/assignments/${assignmentId}`);

export const updateAssignment = (assignmentId: number, body: object) =>
  apiPut(`/api/assignments/${assignmentId}`, body);

export const addAssignmentQuestion = (assignmentId: number, questionText: string) =>
  apiPost(`/api/assignments/${assignmentId}/question`, { question_text: questionText });

export const addQuestionOptions = (questionId: number, options: any[]) =>
  apiPost(`/api/assignments/question/${questionId}/options`, { options });

export const updateQuestion = (questionId: number, body: object) =>
  apiPut(`/api/assignments/question/${questionId}`, body);

export const deleteQuestion = (questionId: number) =>
  apiDelete(`/api/assignments/question/${questionId}`);

// ─── Notifications ───────────────────────────────────────────

export const fetchNotifications = () => apiFetch("/api/notifications");

export const markNotificationRead = (id: number) =>
  apiPatch(`/api/notifications/${id}/read`);

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