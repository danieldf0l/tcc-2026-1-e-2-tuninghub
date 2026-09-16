import api from './axiosInstance';

export const listarEstilosAtivos = () => api.get('/estilo').then((r) => r.data);
export const listarEstilosAdmin = () => api.get('/estilo/admin').then((r) => r.data);
export const criarEstilo = (nome) => api.post('/estilo', { nome }).then((r) => r.data);
export const atualizarEstilo = (id, nome) => api.put(`/estilo/${id}`, { nome }).then((r) => r.data);
export const desativarEstilo = (id) => api.delete(`/estilo/${id}`).then((r) => r.data);
export const reativarEstilo = (id) => api.patch(`/estilo/${id}/reativar`).then((r) => r.data);