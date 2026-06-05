import axiosInstance from "./axiosInstance";
export const getSaleReturns = () => axiosInstance.get("/saleReturns");
export const getSaleReturn = (id) => axiosInstance.get(`/saleReturns/${id}`);
export const createSaleReturn = (data) =>
  axiosInstance.post("/saleReturns", data);
export const updateSaleReturn = (id, data) =>
  axiosInstance.put(`/saleReturns/${id}`, data);
export const deleteSaleReturn = (id) =>
  axiosInstance.delete(`/saleReturns/${id}`);
