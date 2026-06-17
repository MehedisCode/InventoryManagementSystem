import axiosInstance from "./axiosInstance";

const BASE = "/api/balance-transfers";

export const getAll = (status) =>
  axiosInstance.get(BASE, { params: status ? { status } : undefined });

export const getById = (id) => axiosInstance.get(`${BASE}/${id}`);

export const create = (data) => axiosInstance.post(BASE, data);

export const update = (id, data) => axiosInstance.put(`${BASE}/${id}`, data);

export const deleteTransfer = (id) => axiosInstance.delete(`${BASE}/${id}`);

export const complete = (id) => axiosInstance.post(`${BASE}/${id}/complete`);

export const cancel = (id) => axiosInstance.post(`${BASE}/${id}/cancel`);
