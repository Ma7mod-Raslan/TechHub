import axios, { AxiosInstance } from "axios";

console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);


const BASE = import.meta.env.VITE_API_URL || "${API_URL}/api";


const api: AxiosInstance = axios.create({
  baseURL: BASE,
  // withCredentials: true // enable if you use httpOnly cookies for refresh
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    // ignore
  }
  return config;
});

export default api;
