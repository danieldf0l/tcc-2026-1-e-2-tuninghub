import api from './axiosInstance';

export const listarPlanosAdmin = () => api.get('/plano/admin').then((r) => r.data);

export const criarPlano = (nome, valor, duracaoDias) =>
  api.post('/plano', { nome, valor, duracaoDias }).then((r) => r.data);

export const atualizarPlano = (id, nome, duracaoDias) =>
  api.put(`/plano/${id}`, { nome, duracaoDias }).then((r) => r.data);

export const vincularProdutoExterno = (id, idProdutoExterno) =>
  api.patch(`/plano/${id}/produto-externo`, { idProdutoExterno }).then((r) => r.data);

export const desativarPlano = (id) => api.delete(`/plano/${id}`).then((r) => r.data);

export const reativarPlano = (id) => api.patch(`/plano/${id}/reativar`).then((r) => r.data);