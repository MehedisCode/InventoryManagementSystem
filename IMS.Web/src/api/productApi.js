import axiosInstance from "./axiosInstance";

export const getProducts = () => axiosInstance.get("/api/Products");

export const getProduct = (id) => axiosInstance.get(`/api/Products/${id}`);

export const getLowStockProducts = () =>
  axiosInstance.get("/api/Products/low-stock");

export const createProduct = (data) =>
  axiosInstance.post("/api/Products", data);

export const updateProduct = (id, data) =>
  axiosInstance.put(`/api/Products/${id}`, data);

export const deleteProduct = (id) =>
  axiosInstance.delete(`/api/Products/${id}`);
