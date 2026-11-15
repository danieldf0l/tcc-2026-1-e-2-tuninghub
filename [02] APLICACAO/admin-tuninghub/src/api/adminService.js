import api from './axiosInstance';

export const listarAdmins = () => api.get('/admin').then((r) => r.data);

export const criarAdmin = (dados) => api.post('/admin', dados);

export const atualizarAdmin = (id, dados) => api.put(`/admin/${id}`, dados);

export const alterarStatusAdmin = (id, ativo) => api.patch(`/admin/${id}/status`, { ativo });

export const listarLogs = (params) => api.get('/admin/logs', { params });