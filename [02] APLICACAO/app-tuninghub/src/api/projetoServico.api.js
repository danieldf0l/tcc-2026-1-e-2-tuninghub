import api from './client';

export async function listarItensDoProjeto(idProjeto) {
  const { data } = await api.get(`/projetoservico/${idProjeto}`);
  return data;
}

export async function adicionarItem(idProjeto, idServico) {
  const { data } = await api.post('/projetoservico', { idProjeto, idServico });
  return data.vinculo;
}

export async function adicionarVariosItens(idProjeto, idsServico) {
  return Promise.all(idsServico.map((idServico) => adicionarItem(idProjeto, idServico)));
}

export async function removerItem(idProjeto, idServico) {
  const { data } = await api.delete(`/projetoservico/${idProjeto}/${idServico}`);
  return data;
}

export async function marcarConcluido(idProjeto, idServico, concluido) {
  const { data } = await api.patch(`/projetoservico/${idProjeto}/${idServico}/concluido`, { concluido });
  return data;
}