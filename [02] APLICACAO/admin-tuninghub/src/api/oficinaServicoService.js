import api from './axiosInstance';

export const listarServicosDaOficina = (idOficina) =>
  api.get(`/oficinaservico/${idOficina}`).then((r) => r.data);