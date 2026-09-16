import api from './axiosInstance';

export const listarAssinaturasAdmin = () => api.get('/assinatura').then((r) => r.data);