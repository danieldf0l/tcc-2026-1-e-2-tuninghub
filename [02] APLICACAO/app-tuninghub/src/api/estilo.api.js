import api from './client';

export async function listarEstilos() {
  const { data } = await api.get('/estilo');
  return data;
}

// "Kit" de serviços sugeridos de um estilo (rota pública). :codigo é o Codigo do estilo.
export async function listarServicosSugeridos(codigo) {
  const { data } = await api.get(`/estiloservicosugerido/${codigo}`);
  return data;
}