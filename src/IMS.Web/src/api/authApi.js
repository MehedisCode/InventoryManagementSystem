import axiosInstance from "./axiosInstance";

export const login = (email, password) =>
  axiosInstance.post("/api/Auth/login", { email, password });

export const getMe = () => axiosInstance.get("/api/Auth/me");
