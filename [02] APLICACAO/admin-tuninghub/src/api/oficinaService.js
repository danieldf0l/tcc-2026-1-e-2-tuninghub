import api from './axiosInstance';

export const listarOficinasAdmin = () => api.get('/oficina/admin').then((r) => r.data);

export const atualizarFaixaPreco = (id, faixaPreco) =>
  api.put(`/oficina/${id}/faixa-preco`, { faixaPreco }).then((r) => r.data);

export const desativarOficina = (id) => api.delete(`/oficina/${id}`).then((r) => r.data);

export const reativarOficina = (id) => api.patch(`/oficina/${id}/reativar`).then((r) => r.data);