import api from './axiosInstance';

export const listarProjetosAdmin = () => api.get('/projeto').then((r) => r.data);