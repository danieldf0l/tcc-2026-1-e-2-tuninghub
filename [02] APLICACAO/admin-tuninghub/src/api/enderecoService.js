import api from './axiosInstance';

export const buscarEndereco = (idOficina) =>
  api.get(`/endereco/${idOficina}`).then((r) => r.data);

export const salvarEndereco = (idOficina, dados) =>
  api.post(`/endereco/${idOficina}`, dados).then((r) => r.data);