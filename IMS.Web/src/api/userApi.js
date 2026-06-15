import axiosInstance from "./axiosInstance";

const BASE = "/api/Users";

export const getAll = () => axiosInstance.get(BASE);
export const getById = (id) => axiosInstance.get(`${BASE}/${id}`);
export const create = (data) => axiosInstance.post(BASE, data);
export const update = (id, data) => axiosInstance.put(`${BASE}/${id}`, data);

export const deleteUser = (id) => axiosInstance.delete(`${BASE}/${id}`);

export const toggleStatus = (id) =>
  axiosInstance.post(`${BASE}/${id}/toggle-status`);

export const changePassword = (id, data) =>
  axiosInstance.post(`${BASE}/${id}/change-password`, data);
