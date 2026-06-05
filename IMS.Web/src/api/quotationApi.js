import axiosInstance from "./axiosInstance";
export const getQuotations = () => axiosInstance.get("/quotations");
export const getQuotation = (id) => axiosInstance.get(`/quotations/${id}`);
export const createQuotation = (data) =>
  axiosInstance.post("/quotations", data);
export const updateQuotation = (id, data) =>
  axiosInstance.put(`/quotations/${id}`, data);
export const deleteQuotation = (id) =>
  axiosInstance.delete(`/quotations/${id}`);
