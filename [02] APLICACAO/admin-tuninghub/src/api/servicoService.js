import api from './axiosInstance';

export const listarServicosAdmin = () => api.get('/servico/admin').then((r) => r.data);

export const criarServico = (nome, descricao, idCategoria) =>
  api.post('/servico', { nome, descricao, idCategoria }).then((r) => r.data);

export const atualizarServico = (id, nome, descricao, idCategoria) =>
  api.put(`/servico/${id}`, { nome, descricao, idCategoria }).then((r) => r.data);

export const desativarServico = (id) => api.delete(`/servico/${id}`).then((r) => r.data);

export const reativarServico = (id) => api.patch(`/servico/${id}/reativar`).then((r) => r.data);