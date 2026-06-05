import axiosInstance from "./axiosInstance";
export const getSetupSettings = () => axiosInstance.get("/setup");
export const updateSetupSettings = (data) => axiosInstance.put("/setup", data);
