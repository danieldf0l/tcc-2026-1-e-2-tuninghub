import api from './client';

export async function listarModelosPorMontadora(idMontadora) {
  const { data } = await api.get(`/modelo/montadora/${idMontadora}`);
  return data;
}

export async function listarTodosModelos() {
  const { data } = await api.get('/modelo');
  return data;
}