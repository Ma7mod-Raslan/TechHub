// ============================================================
// adminApi.ts — Centralized API Layer for Admin Panel
// Applies: Single Responsibility, Dependency Inversion (SOLID)
// All fetch logic lives here. Components stay UI-only.
// ============================================================

const getAuthHeader = (): Record<string, string> => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

const jsonHeaders = (): Record<string, string> => ({
  ...getAuthHeader(),
  "Content-Type": "application/json",
});

// ─── Generic helpers ────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options?.headers ?? {}),
      ...getAuthHeader(),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

async function apiPatch<T>(url: string, body?: object): Promise<T> {
  return apiFetch<T>(url, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function apiDelete<T>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: "DELETE", headers: getAuthHeader() });
}

async function apiPost<T>(url: string, body: object): Promise<T> {
  return apiFetch<T>(url, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
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

// ─── Dashboard ──────────────────────────────────────────────

export const fetchDashboardStats = () =>
  apiFetch("/api/admin/dashboard/stats");

export const fetchDashboardActivity = () =>
  apiFetch("/api/admin/dashboard/activity");

export const fetchRecentUsers = () =>
  apiFetch("/api/admin/users/recent");

// ─── Users ──────────────────────────────────────────────────

export const fetchInstructors = () =>
  apiFetch("/api/admin/instructors");

export const fetchStudents = () =>
  apiFetch("/api/admin/students");

export const toggleUserStatus = (userId: number) =>
  apiPatch(`/api/admin/users/${userId}/toggle-status`);

// ─── Courses ────────────────────────────────────────────────

export const fetchAllCourses = () =>
  apiFetch("/api/admin/courses");

export const fetchCourseDetails = (courseId: number) =>
  apiFetch(`/api/admin/courses/${courseId}`);

export const toggleCourseStatus = (courseId: number) =>
  apiPatch(`/api/admin/courses/${courseId}/toggle-status`);

export const deleteCourse = (courseId: number) =>
  apiDelete(`/api/admin/courses/${courseId}`);

// ─── Communities ────────────────────────────────────────────

export const fetchAllCommunities = () =>
  apiFetch("/api/admin/communities");

export const fetchCommunityDetails = (communityId: number) =>
  apiFetch(`/api/admin/communities/${communityId}`);

export const togglePostVisibility = (postId: number) =>
  apiPatch(`/api/admin/posts/${postId}/toggle-hide`);

export const deletePost = (postId: number) =>
  apiDelete(`/api/admin/posts/${postId}`);

export const fetchPostReplies = (postId: number) =>
  apiFetch(`/api/admin/posts/${postId}/replies`);

export const toggleReplyVisibility = (replyId: number) =>
  apiPatch(`/api/admin/replies/${replyId}/toggle-hide`);

export const deleteReply = (replyId: number) =>
  apiDelete(`/api/admin/replies/${replyId}`);

// ─── Reports & Contact Messages ─────────────────────────────

export const fetchAllReports = () =>
  apiFetch("/api/admin/reports");

export const fetchReportDetails = (reportId: number) =>
  apiFetch(`/api/admin/reports/${reportId}`);

export const toggleReportStatus = (reportId: number) =>
  apiPatch(`/api/admin/reports/${reportId}/toggle-status`);

export const deleteReport = (reportId: number) =>
  apiDelete(`/api/admin/reports/${reportId}`);

export const fetchContactMessages = () =>
  apiFetch("/api/admin/contact-messages");

export const deleteContactMessage = (messageId: number) =>
  apiDelete(`/api/admin/contact-messages/${messageId}`);

export const replyToContactMessage = (messageId: number, replyText: string) =>
  apiPost(`/api/admin/contact-messages/${messageId}/reply`, { replyText });

// ─── Notifications ──────────────────────────────────────────

export const fetchNotifications = () =>
  apiFetch("/api/admin/notifications");

export const markNotificationRead = (id: number) =>
  apiPatch(`/api/admin/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  apiPatch("/api/admin/notifications/read-all");

export const deleteNotification = (id: number) =>
  apiDelete(`/api/notifications/${id}`);

// ─── Profile ────────────────────────────────────────────────

export const fetchAdminProfile = () =>
  apiFetch("/api/admin/profile");

export const updateAdminProfile = (body: {
  name: string;
  phone: string;
  linkedin: string;
  location: string;
}) => apiPut("/api/admin/update-profile", body);

export const updateAdminImage = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return apiPut("/api/admin/update-image", form);
};

// ─── Settings ───────────────────────────────────────────────

export const changePassword = (currentPassword: string, newPassword: string) =>
  apiPost("/api/api/auth/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });

export const changeEmail = (newEmail: string) =>
  apiPost("/api/api/auth/change-email", { new_email: newEmail });