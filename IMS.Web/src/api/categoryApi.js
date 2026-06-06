import axiosInstance from "./axiosInstance";

export const getCategories = () => axiosInstance.get("/api/Categories");

export const getCategory = (id) => axiosInstance.get(`/api/Categories/${id}`);

export const createCategory = (data) =>
  axiosInstance.post("/api/Categories", data);

export const updateCategory = (id, data) =>
  axiosInstance.put(`/api/Categories/${id}`, data);

export const deleteCategory = (id) =>
  axiosInstance.delete(`/api/Categories/${id}`);
