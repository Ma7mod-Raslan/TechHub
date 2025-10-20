// src/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  withCredentials: true, // لو هتستخدمي refresh tokens في httpOnly cookie
  headers: { 'Content-Type': 'application/json' },
});

export default api;
