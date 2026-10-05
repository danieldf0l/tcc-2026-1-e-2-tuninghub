import api from './client';

export async function listarPlanos() {
  const { data } = await api.get('/plano');
  return data;
}