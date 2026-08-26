import api from './axiosInstance';

export const listarModelosAdmin = () => api.get('/modelo/admin').then((r) => r.data);
export const criarModelo = (idMontadora, nome) => api.post('/modelo', { idMontadora, nome }).then((r) => r.data);
export const atualizarModelo = (id, nome) => api.put(`/modelo/${id}`, { nome }).then((r) => r.data);
export const desativarModelo = (id) => api.delete(`/modelo/${id}`).then((r) => r.data);
export const reativarModelo = (id) => api.patch(`/modelo/${id}/reativar`).then((r) => r.data);