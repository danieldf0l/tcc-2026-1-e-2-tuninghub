import api from './client';

export async function buscarMinhaAssinatura() {
  const { data } = await api.get('/assinatura/minha');
  return data; // null ou objeto da assinatura
}

export async function assinarPlanoGratuito(idPlano) {
  const dataInicio = new Date().toISOString().slice(0, 10);
  const { data } = await api.post('/assinatura/gratuita', { idPlano, dataInicio });
  return data.assinatura;
}

// Também serve para renovar (últimos 7 dias) e para retomar um PIX pendente (devolve a mesma URL)
export async function iniciarCheckout(idPlano) {
  const { data } = await api.post('/assinatura/checkout', { idPlano });
  return data; // { message, idAssinatura, checkoutUrl, reaproveitado? }
}

export async function confirmarPagamento(idAssinatura) {
  const { data } = await api.post(`/assinatura/${idAssinatura}/confirmar-pagamento`);
  return data; // { status: 'ATIVA', dataInicio, dataFim, renovacao } ou { status, message }
}

// Cancela o Pro (volta ao gratuito) ou um PIX pendente.
// apenasRenovacaoPendente: cancela só o PIX de renovação e mantém o Pro atual.
export async function cancelarAssinatura({ apenasRenovacaoPendente = false } = {}) {
  const corpo = { confirmacao: 'CANCELAR' };
  if (apenasRenovacaoPendente) corpo.apenasRenovacaoPendente = true;
  const { data } = await api.post('/assinatura/minha/cancelar', corpo);
  return data; // { message, reembolso, assinatura }
}
