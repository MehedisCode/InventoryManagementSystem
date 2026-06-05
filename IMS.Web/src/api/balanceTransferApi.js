import axiosInstance from "./axiosInstance";
export const getBalanceTransfers = () => axiosInstance.get("/balanceTransfers");
export const getBalanceTransfer = (id) =>
  axiosInstance.get(`/balanceTransfers/${id}`);
export const createBalanceTransfer = (data) =>
  axiosInstance.post("/balanceTransfers", data);
export const updateBalanceTransfer = (id, data) =>
  axiosInstance.put(`/balanceTransfers/${id}`, data);
export const deleteBalanceTransfer = (id) =>
  axiosInstance.delete(`/balanceTransfers/${id}`);
