import axiosInstance from "./axiosInstance";

export const getSuppliers = () => axiosInstance.get("/api/Suppliers");

export const getSupplier = (id) => axiosInstance.get(`/api/Suppliers/${id}`);

export const createSupplier = (data) =>
  axiosInstance.post("/api/Suppliers", data);

export const updateSupplier = (id, data) =>
  axiosInstance.put(`/api/Suppliers/${id}`, data);

export const deleteSupplier = (id) =>
  axiosInstance.delete(`/api/Suppliers/${id}`);
