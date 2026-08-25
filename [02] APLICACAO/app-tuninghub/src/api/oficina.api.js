import api from './client';

export async function buscarOficinas({ idServico, lat, lng } = {}) {
  const params = {};
  if (idServico) params.idServico = idServico;
  if (lat !== undefined) params.lat = lat;
  if (lng !== undefined) params.lng = lng;

  const { data } = await api.get('/oficina/buscar', { params });
  return data;
}