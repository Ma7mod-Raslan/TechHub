import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Axios instance for TechHub backend
 * Uses JWT (Bearer token) from localStorage
 */
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach Authorization header automatically
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); // ✅ نفس الاسم المستخدم في Login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   COURSES – INSTRUCTOR
========================= */

/**
 * Create new course (Draft)
 * POST /api/courses/create
 */
export const createCourse = async (formData: FormData) => {
  const res = await api.post("/courses/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.course ?? res.data;
};




/**
 * Get instructor courses
 * GET /api/courses/instructor
 */
export const getInstructorCourses = async (
  status?: "Draft" | "Published"
) => {
  const res = await api.get("/courses/instructor", {
    params: status ? { status } : {},
  });
  return res.data;
};

/**
 * Get course details
 * GET /api/courses/:id
 */
export const getCourseById = async (courseId: number) => {
  const res = await api.get(`/courses/${courseId}`);
  return res.data;
};

/**
 * Update course
 * PUT /api/courses/:id
 */
export const updateCourse = async (
  courseId: number,
  data: {
    title: string;
    description: string;
    category: string;
    level: string;
    thumbnail?: string;
  }
) => {
  const res = await api.put(`/courses/${courseId}`, data);
  return res.data;
};

/**
 * Publish course
 * PUT /api/courses/:id/publish
 */
export const publishCourse = async (courseId: number) => {
  const res = await api.put(`/courses/${courseId}/publish`);
  return res.data;
};

/**
 * Delete course
 * DELETE /api/courses/:id
 */
export const deleteCourse = async (courseId: number) => {
  const res = await api.delete(`/courses/${courseId}`);
  return res.data;
};

/* =========================
   COURSES – STUDENT / PUBLIC
========================= */

/**
 * Get all published courses (for students)
 * GET /api/courses
 */
export const getAllCourses = async () => {
  const res = await api.get("/courses");
  return res.data.courses; // مهم جدًا
};


/* =========================
   VIDEOS
========================= */

/**
 * Get course videos
 * GET /api/courses/:id/videos
 */
export const getCourseVideos = async (courseId: number) => {
  const res = await api.get(`/courses/${courseId}/videos`);
  return res.data;
};

/**
 * Add video to course
 * POST /api/courses/:id/videos
 */
export const addVideoToCourse = async (
  courseId: number,
  data: {
    title: string;
    description?: string;
    video_url: string;
    video_order: number;
  }
) => {
  const res = await api.post(`/courses/${courseId}/videos`, data);
  return res.data;
};

/**
 * Update video
 * PUT /api/courses/:courseId/videos/:videoId
 */
export const updateVideo = async (
  courseId: number,
  videoId: number,
  data: {
    title?: string;
    description?: string;
    video_url?: string;
    video_order?: number;
  }
) => {
  const res = await api.put(
    `/courses/${courseId}/videos/${videoId}`,
    data
  );
  return res.data;
};

/**
 * Delete video
 * DELETE /api/courses/:courseId/videos/:videoId
 */
export const deleteVideo = async (
  courseId: number,
  videoId: number
) => {
  const res = await api.delete(
    `/courses/${courseId}/videos/${videoId}`
  );
  return res.data;
};
