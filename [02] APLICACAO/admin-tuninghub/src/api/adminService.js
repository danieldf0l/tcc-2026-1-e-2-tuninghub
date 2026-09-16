import api from './axiosInstance';

export const listarAdmins = () => api.get('/admin').then((r) => r.data);