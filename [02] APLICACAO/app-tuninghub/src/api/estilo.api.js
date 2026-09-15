import api from './client';

export async function listarEstilos() {
  const { data } = await api.get('/estilo');
  return data;
}