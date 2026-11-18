import {
  Gauge, ArrowUpDown, CircleDot, Disc, Wind, Paintbrush,
  Sparkles, Lightbulb, Speaker, Armchair, Wrench,
} from 'lucide-react-native';

// `icone` (emoji) fica temporariamente para telas ainda não redesenhadas; usar `Icone` (lucide).
// As chaves são o NOME da categoria no banco, normalizado (sem acento, maiúsculo, espaço → _).
export const CATEGORIAS_SERVICO = {
  MOTOR_E_PERFORMANCE: { rotulo: 'Motor e Performance', Icone: Gauge, icone: '🔧' },
  SUSPENSAO: { rotulo: 'Suspensão', Icone: ArrowUpDown, icone: '🛞' },
  RODAS_E_PNEUS: { rotulo: 'Rodas e Pneus', Icone: CircleDot, icone: '⚙️' },
  FREIOS: { rotulo: 'Freios', Icone: Disc, icone: '🛑' },
  CARROCERIA_E_AERODINAMICA: { rotulo: 'Carroceria e Aerodinâmica', Icone: Wind, icone: '💨' },
  PINTURA_E_ENVELOPAMENTO: { rotulo: 'Pintura e Envelopamento', Icone: Paintbrush, icone: '🎨' },
  ESTETICA_E_PROTECAO: { rotulo: 'Estética e Proteção', Icone: Sparkles, icone: '✨' },
  ILUMINACAO_E_ELETRICA: { rotulo: 'Iluminação e Elétrica', Icone: Lightbulb, icone: '💡' },
  SOM_E_MULTIMIDIA: { rotulo: 'Som e Multimídia', Icone: Speaker, icone: '🔊' },
  INTERIOR: { rotulo: 'Interior', Icone: Armchair, icone: '🪑' },
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