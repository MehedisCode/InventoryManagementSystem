import axiosInstance from "./axiosInstance";

export const getPurchases = () => axiosInstance.get("/api/Purchases");

export const getPurchase = (id) => axiosInstance.get(`/api/Purchases/${id}`);

export const createPurchase = (data) =>
  axiosInstance.post("/api/Purchases", data);

export const updatePurchase = (id, data) =>
  axiosInstance.put(`/api/Purchases/${id}`, data);

export const deletePurchase = (id) =>
  axiosInstance.delete(`/api/Purchases/${id}`);
