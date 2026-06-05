import axiosInstance from "./axiosInstance";
export const getSales = () => axiosInstance.get("/sales");
export const getSale = (id) => axiosInstance.get(`/sales/${id}`);
export const createSale = (data) => axiosInstance.post("/sales", data);
export const updateSale = (id, data) => axiosInstance.put(`/sales/${id}`, data);
export const deleteSale = (id) => axiosInstance.delete(`/sales/${id}`);
