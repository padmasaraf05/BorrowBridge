import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor — attach token from localStorage
api.interceptors.request.use(
  (config) => {
    // Read token fresh on every request
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor — don't redirect on protected pages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const protectedPaths = [
        "/dashboard",
        "/profile",
        "/my-listings",
        "/messages",
        "/requests",
        "/add-listing",
      ];
      const isProtected = protectedPaths.some((p) =>
        currentPath.startsWith(p)
      );

      if (!isProtected) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;