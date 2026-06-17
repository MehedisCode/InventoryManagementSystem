import axiosInstance from "./axiosInstance";

export const getSummary = () => axiosInstance.get("/api/Dashboard/summary");

export const getMonthlyChart = (year) =>
  axiosInstance.get(`/api/Dashboard/monthly-chart`, { params: { year } });

export const getTopProducts = (count) =>
  axiosInstance.get(`/api/Dashboard/top-products`, { params: { count } });
