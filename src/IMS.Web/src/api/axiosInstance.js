import axios from "axios";
import { useAuthStore } from "../store/authStore";

// `VITE_API_URL` is the escape hatch for production deployments where
// the API lives on a different host (e.g. `https://api.example.com`).
//
// In Docker and in local `npm run dev`, the value is left unset and
// `baseURL` falls back to an empty string — calls are then made to the
// same origin, and the proxy layer (nginx in Docker, Vite dev server
// locally) forwards `/api/*` to the backend. This avoids CORS entirely
// and keeps a single set of relative paths in the API modules.
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
