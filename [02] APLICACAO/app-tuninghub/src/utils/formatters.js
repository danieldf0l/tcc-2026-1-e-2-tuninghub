export function formatarMoeda(valor) {
  const numero = Number(valor);
  if (!numero || numero <= 0) return 'Grátis';
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarData(dataISO) {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}