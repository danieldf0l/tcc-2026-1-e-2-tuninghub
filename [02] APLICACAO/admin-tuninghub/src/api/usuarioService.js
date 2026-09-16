import api from './axiosInstance';

export const listarUsuariosAdmin = () => api.get('/usuario/admin').then((r) => r.data);
export const desativarUsuario = (id) => api.delete(`/usuario/${id}`).then((r) => r.data);
export const reativarUsuario = (id) => api.patch(`/usuario/${id}/reativar`).then((r) => r.data);