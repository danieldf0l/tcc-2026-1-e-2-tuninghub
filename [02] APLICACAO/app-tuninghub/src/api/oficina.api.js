import api from './client';

export async function buscarOficinas({ idServico, lat, lng } = {}) {
  const params = {};
  if (idServico) params.idServico = idServico;
  if (lat !== undefined) params.lat = lat;
  if (lng !== undefined) params.lng = lng;

  const { data } = await api.get('/oficina/buscar', { params });
  return data;
}

export async function cadastrarOficina(dados) {
  const { data } = await api.post('/oficina', dados);
  return data.oficina;
}

export async function aceitarTermosOficina() {
  const { data } = await api.patch('/oficina/aceitar-termos');
  return data;
}

export async function atualizarMinhaFaixaPreco(faixaPreco) {
  const { data } = await api.patch('/oficina/me/faixa-preco', { faixaPreco });
  return data;
}

// Oficinas que atendem os serviços pendentes de um projeto (paginado no back).
// idServicos: array opcional (subconjunto dos pendentes); sem ele, o back usa todos.
export async function buscarOficinasPorProjeto({ idProjeto, idServicos, lat, lng, pagina = 1, limite = 10 }) {
  const params = { idProjeto, pagina, limite };
  if (idServicos && idServicos.length) params.idServicos = idServicos.join(',');
  if (lat !== undefined) params.lat = lat;
  if (lng !== undefined) params.lng = lng;

  const { data } = await api.get('/oficina/buscar-por-projeto', { params });
  return data; // { projeto, servicosBuscados, pagina, limite, total, temMais, oficinas }
}