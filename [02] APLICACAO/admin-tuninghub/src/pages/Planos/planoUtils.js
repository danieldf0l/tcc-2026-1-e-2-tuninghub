// Formatação usada na listagem e nos modais de planos

export const formatarMoeda = (valor) =>
  Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const ehGratuito = (plano) => Number(plano.Valor) === 0;

// 30 → "mensal", 365 → "anual" (só para leitura rápida; o que vale é o número de dias)
export const apelidoDuracao = (dias) => {
  const n = Number(dias);
  if (n === 7) return 'semanal';
  if (n === 30 || n === 31) return 'mensal';
  if (n === 90) return 'trimestral';
  if (n === 180) return 'semestral';
  if (n === 365 || n === 366) return 'anual';
  return '';
};