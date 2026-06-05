import axiosInstance from "./axiosInstance";
export const getPurchases = () => axiosInstance.get("/purchases");
export const getPurchase = (id) => axiosInstance.get(`/purchases/${id}`);
export const createPurchase = (data) => axiosInstance.post("/purchases", data);
export const updatePurchase = (id, data) =>
  axiosInstance.put(`/purchases/${id}`, data);
export const deletePurchase = (id) => axiosInstance.delete(`/purchases/${id}`);
