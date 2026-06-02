import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
export const API_BASE_URL = import.meta.env.DEV ? "" : configuredBaseUrl;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 120000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("shiwar_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const mediaUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
};

export const enhancedDownloadUrl = (path) => {
  if (!path) return "";
  const url = new URL(path, API_BASE_URL || window.location.origin);
  const filename = url.pathname.split("/").filter(Boolean).pop();
  return filename ? `${API_BASE_URL}/api/vision/download/enhanced/${encodeURIComponent(filename)}` : "";
};

export const apiErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  const detail = error.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((item) => item.msg || item.message || String(item)).join(", ");
  }
  if (error.code === "ERR_NETWORK") return "Cannot reach the backend API. Start the backend server and try again.";
  if (error.code === "ECONNABORTED") return "Request timed out. Please try again.";
  return fallback;
};

export default api;
