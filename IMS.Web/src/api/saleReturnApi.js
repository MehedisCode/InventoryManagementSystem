import axiosInstance from "./axiosInstance";

export const getSaleReturns = () => axiosInstance.get("/api/sale-returns");

export const getSaleReturn = (id) => axiosInstance.get(`/api/sale-returns/${id}`);

export const createSaleReturn = (data) =>
  axiosInstance.post("/api/sale-returns", data);

export const updateSaleReturn = (id, data) =>
  axiosInstance.put(`/api/sale-returns/${id}`, data);

export const deleteSaleReturn = (id) =>
  axiosInstance.delete(`/api/sale-returns/${id}`);

export const approveSaleReturn = (id) =>
  axiosInstance.post(`/api/sale-returns/${id}/approve`);

export const rejectSaleReturn = (id) =>
  axiosInstance.post(`/api/sale-returns/${id}/reject`);
