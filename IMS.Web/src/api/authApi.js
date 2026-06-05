import axiosInstance from "./axiosInstance";
export const login = (data) => axiosInstance.post("/auth/login", data);
