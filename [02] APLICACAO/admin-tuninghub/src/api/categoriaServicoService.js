import api from './axiosInstance';

export const listarCategoriasAtivas = () => api.get('/categoriaservico').then((r) => r.data);
export const listarCategoriasAdmin = () => api.get('/categoriaservico/admin').then((r) => r.data);
export const criarCategoria = (nome) => api.post('/categoriaservico', { nome }).then((r) => r.data);
export const atualizarCategoria = (id, nome) => api.put(`/categoriaservico/${id}`, { nome }).then((r) => r.data);
export const desativarCategoria = (id) => api.delete(`/categoriaservico/${id}`).then((r) => r.data);
export const reativarCategoria = (id) => api.patch(`/categoriaservico/${id}/reativar`).then((r) => r.data);