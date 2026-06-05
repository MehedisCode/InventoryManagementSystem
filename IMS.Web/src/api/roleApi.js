import axiosInstance from "./axiosInstance";
export const getRoles = () => axiosInstance.get("/roles");
export const getRole = (id) => axiosInstance.get(`/roles/${id}`);
export const createRole = (data) => axiosInstance.post("/roles", data);
export const updateRole = (id, data) => axiosInstance.put(`/roles/${id}`, data);
export const deleteRole = (id) => axiosInstance.delete(`/roles/${id}`);
