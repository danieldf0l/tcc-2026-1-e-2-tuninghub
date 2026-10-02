import api from './client';

export async function listarServicosDaOficina(idOficina) {
  const { data } = await api.get(`/oficinaservico/${idOficina}`);
  return data;
}

export async function vincularServico(idServico) {
  const { data } = await api.post('/oficinaservico', { idServico });
  return data.vinculo;
}

export async function desvincularServico(idOficina, idServico) {
  const { data } = await api.delete(`/oficinaservico/${idOficina}/${idServico}`);
  return data;
}