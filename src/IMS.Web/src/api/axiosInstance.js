import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { queryClient } from "./queryClient";
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
      queryClient.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
