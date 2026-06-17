import axiosInstance from "./axiosInstance";

export const getQuotations = () => axiosInstance.get("/api/Quotations");

export const getQuotation = (id) => axiosInstance.get(`/api/Quotations/${id}`);

export const getExpiredQuotations = () =>
  axiosInstance.get("/api/Quotations/expired");

export const createQuotation = (data) =>
  axiosInstance.post("/api/Quotations", data);

export const updateQuotation = (id, data) =>
  axiosInstance.put(`/api/Quotations/${id}`, data);

export const deleteQuotation = (id) =>
  axiosInstance.delete(`/api/Quotations/${id}`);

export const convertToSale = (id) =>
  axiosInstance.post(`/api/Quotations/${id}/convert-to-sale`);
