import axiosInstance from "./axiosInstance";

export const getCustomers = () => axiosInstance.get("/api/customers");

export const getCustomer = (id) => axiosInstance.get(`/api/customers/${id}`);

export const createCustomer = (data) =>
  axiosInstance.post("/api/customers", data);

export const updateCustomer = (id, data) =>
  axiosInstance.put(`/api/customers/${id}`, data);

export const deleteCustomer = (id) =>
  axiosInstance.delete(`/api/customers/${id}`);
