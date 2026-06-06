import axiosInstance from "./axiosInstance";

export const getSetupSettings = () => axiosInstance.get("/setup");

export const updateSetupSettings = (data) => axiosInstance.put("/setup", data);

export const getUnits = () => axiosInstance.get("/api/setup/Units");
