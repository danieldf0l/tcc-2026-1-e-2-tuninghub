import api from './client';

export async function listarServicosDaOficina(idOficina) {
  const { data } = await api.get(`/oficinaservico/${idOficina}`);
  return data;
}