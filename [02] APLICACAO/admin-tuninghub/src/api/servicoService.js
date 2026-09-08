import api from './axiosInstance';

export const listarServicosAdmin = () => api.get('/servico/admin').then((r) => r.data);

export const criarServico = (nome, descricao, categoria) =>
  api.post('/servico', { nome, descricao, categoria }).then((r) => r.data);

export const atualizarServico = (id, nome, descricao, categoria) =>
  api.put(`/servico/${id}`, { nome, descricao, categoria }).then((r) => r.data);

export const desativarServico = (id) => api.delete(`/servico/${id}`).then((r) => r.data);

export const reativarServico = (id) => api.patch(`/servico/${id}/reativar`).then((r) => r.data);