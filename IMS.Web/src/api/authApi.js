import axiosInstance from './axiosInstance';

export const login = (email, password) => axiosInstance.post('/api/Auth/login', { email, password });
export const register = (data) => axiosInstance.post('/api/Auth/register', data);
