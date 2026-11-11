const MAPA = {
  BAIXO: '$',
  MEDIO: '$$',
  ALTO: '$$$',
};

const DESCRICAO = {
  $: 'Econômica',
  $$: 'Intermediária',
  $$$: 'Premium',
};

export function formatarFaixaPreco(valor) {
  if (!valor) return null;
  return MAPA[valor] || valor;
}

// "$$" → "Intermediária"
export function descreverFaixaPreco(valor) {
  const simbolo = formatarFaixaPreco(valor);
  return simbolo ? DESCRICAO[simbolo] || null : null;
}