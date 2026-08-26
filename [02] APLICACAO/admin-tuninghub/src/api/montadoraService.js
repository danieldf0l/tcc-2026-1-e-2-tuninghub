import api from './axiosInstance';

export const listarMontadorasAtivas = () => api.get('/montadora').then((r) => r.data);
export const listarMontadorasAdmin = () => api.get('/montadora/admin').then((r) => r.data);
export const criarMontadora = (nome) => api.post('/montadora', { nome }).then((r) => r.data);
export const atualizarMontadora = (id, nome) => api.put(`/montadora/${id}`, { nome }).then((r) => r.data);
export const desativarMontadora = (id) => api.delete(`/montadora/${id}`).then((r) => r.data);
export const reativarMontadora = (id) => api.patch(`/montadora/${id}/reativar`).then((r) => r.data);