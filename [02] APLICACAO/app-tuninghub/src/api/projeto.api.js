import api from './client';

export async function listarMeusProjetos() {
  const { data } = await api.get('/projeto/meus');
  return data;
}

export async function criarProjeto({ idModelo, descricao, tipoCustomizacao, estilo }) {
  const body = { idModelo, tipoCustomizacao };
  if (descricao) body.descricao = descricao;
  if (tipoCustomizacao === 'ESTILO') body.estilo = estilo;

  const { data } = await api.post('/projeto', body);
  return data.projeto;
}