const MAPA = {
  BAIXO: '$',
  MEDIO: '$$',
  ALTO: '$$$',
};

export function formatarFaixaPreco(valor) {
  if (!valor) return null;
  return MAPA[valor] || valor;
}