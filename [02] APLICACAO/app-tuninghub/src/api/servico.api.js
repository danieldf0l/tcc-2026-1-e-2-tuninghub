import api from './client';

export async function listarServicos() {
  const { data } = await api.get('/servico');
  return data; 
}