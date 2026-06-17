import axiosInstance from "./axiosInstance";

export const getSales = () => axiosInstance.get("/api/sales");

export const getSale = (id) => axiosInstance.get(`/api/sales/${id}`);

export const createSale = (data) => axiosInstance.post("/api/sales", data);

export const updateSale = (id, data) =>
  axiosInstance.put(`/api/sales/${id}`, data);

export const deleteSale = (id) => axiosInstance.delete(`/api/sales/${id}`);
