import api from './client';

export async function listarImagensDaOficina(idOficina) {
  const { data } = await api.get(`/imagem/oficina/${idOficina}`);
  return data;
}