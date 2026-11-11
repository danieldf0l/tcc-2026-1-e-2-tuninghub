import api from './client';

export async function buscarEnderecoOficina(idOficina) {
  const { data } = await api.get(`/endereco/${idOficina}`);
  return data;
}

export async function listarServicosOficina(idOficina) {
  const { data } = await api.get(`/oficinaservico/${idOficina}`);
  return data;
}

export async function listarImagensOficina(idOficina) {
  const { data } = await api.get(`/imagem/oficina/${idOficina}`);
  return data;
}

// Perfil público de UMA oficina ativa (endereço, faixa de preço e a regra de contato do Pro)
export async function buscarPerfilPublicoOficina(idOficina) {
  const { data } = await api.get(`/oficina/${idOficina}`);
  return data;
}