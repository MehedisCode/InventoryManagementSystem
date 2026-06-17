import axiosInstance from "./axiosInstance";

// Company settings
export const getCompany = () => axiosInstance.get("/api/setup/company");
export const updateCompany = (data) =>
  axiosInstance.put("/api/setup/company", data);

// Units
export const getUnits = () => axiosInstance.get("/api/setup/Units");
export const createUnit = (data) =>
  axiosInstance.post("/api/setup/Units", data);
export const updateUnit = (id, data) =>
  axiosInstance.put(`/api/setup/Units/${id}`, data);
export const deleteUnit = (id) =>
  axiosInstance.delete(`/api/setup/Units/${id}`);

// Currencies
export const getCurrencies = () => axiosInstance.get("/api/setup/currencies");
export const createCurrency = (data) =>
  axiosInstance.post("/api/setup/currencies", data);
export const updateCurrency = (id, data) =>
  axiosInstance.put(`/api/setup/currencies/${id}`, data);
export const deleteCurrency = (id) =>
  axiosInstance.delete(`/api/setup/currencies/${id}`);
