import api from './client';

export async function buscarEnderecoDaOficina(idOficina) {
  const { data } = await api.get(`/endereco/${idOficina}`);
  return data;
}

export async function salvarEnderecoDaOficina(idOficina, endereco) {
  const { data } = await api.post(`/endereco/${idOficina}`, endereco);
  return data;
}   