import axiosInstance from "./axiosInstance";

const BASE = "/api/roles";

export const getAll = () => axiosInstance.get(BASE);
export const getById = (id) => axiosInstance.get(`${BASE}/${id}`);
export const create = (data) => axiosInstance.post(BASE, data);
export const update = (id, data) => axiosInstance.put(`${BASE}/${id}`, data);
export const deleteRole = (id) => axiosInstance.delete(`${BASE}/${id}`);
