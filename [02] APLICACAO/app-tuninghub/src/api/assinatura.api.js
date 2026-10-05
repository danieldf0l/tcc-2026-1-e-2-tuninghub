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

export async function iniciarCheckout(idPlano) {
  const { data } = await api.post('/assinatura/checkout', { idPlano });
  return data; // { message, idAssinatura, checkoutUrl }
}

export async function confirmarPagamento(idAssinatura) {
  const { data } = await api.post(`/assinatura/${idAssinatura}/confirmar-pagamento`);
  return data; // { status: 'ATIVA', dataFim } ou { status, message }
}