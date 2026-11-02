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

// "Arquivado" no app = projeto desativado (Ativo = 0) no backend
export async function listarMeusProjetosArquivados() {
  const { data } = await api.get('/projeto/meus/inativos');
  return data;
}

export async function arquivarProjeto(idProjeto) {
  const { data } = await api.delete(`/projeto/${idProjeto}`);
  return data;
}

export async function desarquivarProjeto(idProjeto) {
  const { data } = await api.patch(`/projeto/${idProjeto}/reativar`);
  return data;
}

// Irreversível: o backend só aceita projeto já arquivado
export async function excluirProjetoDefinitivamente(idProjeto) {
  const { data } = await api.delete(`/projeto/${idProjeto}/definitivo`);
  return data;
}