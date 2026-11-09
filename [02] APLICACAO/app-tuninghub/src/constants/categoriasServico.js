import { Cog, ArrowUpDown, CircleDot, Sparkles, Armchair, Wind, Wrench } from 'lucide-react-native';

// `icone` (emoji) fica temporariamente para telas ainda não redesenhadas; usar `Icone` (lucide).
export const CATEGORIAS_SERVICO = {
  MOTOR: { rotulo: 'Motor', Icone: Cog, icone: '🔧' },
  SUSPENSAO: { rotulo: 'Suspensão', Icone: ArrowUpDown, icone: '🛞' },
  RODAS: { rotulo: 'Rodas', Icone: CircleDot, icone: '⚙️' },
  ESTETICA: { rotulo: 'Estética', Icone: Sparkles, icone: '✨' },
  INTERIOR: { rotulo: 'Interior', Icone: Armchair, icone: '🪑' },
  ESCAPAMENTO: { rotulo: 'Escapamento', Icone: Wind, icone: '💨' },
};

// Categoria virou tabela no backend: a API devolve o NOME ("Suspensão"), não a chave antiga.
// Normalizamos (sem acento, maiúsculo, espaço → _) para casar os dois formatos.
function normalizar(texto) {
  return (texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
    .replace(/\s+/g, '_');
}

export function getCategoriaInfo(chave) {
  const conhecida = CATEGORIAS_SERVICO[normalizar(chave)];
  if (conhecida) return conhecida;
  // Categoria nova criada pelo admin: usa o próprio nome e o ícone padrão
  return { rotulo: chave || 'Outros', Icone: Wrench, icone: '🔩' };
}