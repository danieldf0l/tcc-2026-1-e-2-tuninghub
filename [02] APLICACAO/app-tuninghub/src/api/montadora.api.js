import api from './client';

export async function listarMontadoras() {
  const { data } = await api.get('/montadora');
  return data; // array direto
}