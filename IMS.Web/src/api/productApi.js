import axiosInstance from "./axiosInstance";
export const getProducts = () => axiosInstance.get("/products");
export const getProduct = (id) => axiosInstance.get(`/products/${id}`);
export const createProduct = (data) => axiosInstance.post("/products", data);
export const updateProduct = (id, data) =>
  axiosInstance.put(`/products/${id}`, data);
export const deleteProduct = (id) => axiosInstance.delete(`/products/${id}`);
