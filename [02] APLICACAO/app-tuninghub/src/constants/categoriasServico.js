export const CATEGORIAS_SERVICO = {
  MOTOR: { rotulo: 'Motor', icone: '🔧' },
  SUSPENSAO: { rotulo: 'Suspensão', icone: '🛞' },
  RODAS: { rotulo: 'Rodas', icone: '⚙️' },
  ESTETICA: { rotulo: 'Estética', icone: '✨' },
  INTERIOR: { rotulo: 'Interior', icone: '🪑' },
  ESCAPAMENTO: { rotulo: 'Escapamento', icone: '💨' },
};

export function getCategoriaInfo(chave) {
  return CATEGORIAS_SERVICO[chave] || { rotulo: chave || 'Outros', icone: '🔩' };
}