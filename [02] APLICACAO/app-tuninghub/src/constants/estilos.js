import { ChevronsDown, Mountain, Flag, EyeOff, Clock, Zap, Wrench } from 'lucide-react-native';

export const TIPO_CUSTOMIZACAO = {
  ESTILO: 'ESTILO',
  PERSONALIZADA: 'PERSONALIZADA',
};

// Visual (ícone/cor) por código conhecido — puramente estético.
// Estilos novos criados pelo admin caem no visual padrão até decidirmos mapear um específico.
// `icone` (emoji) fica temporariamente para telas ainda não redesenhadas; usar `Icone` (lucide).
const VISUAL_POR_CODIGO = {
  STANCE: { cor: '#E9302E', Icone: ChevronsDown, icone: '🔻' },
  OFF_ROAD: { cor: '#6B5B3E', Icone: Mountain, icone: '⛰️' },
  TRACK_RACING: { cor: '#8F2A28', Icone: Flag, icone: '🏁' },
  SLEEPER: { cor: '#2B2C2E', Icone: EyeOff, icone: '🕶️' },
  CLASSIC_RETRO: { cor: '#9A6B3F', Icone: Clock, icone: '🕰️' },
  JDM: { cor: '#C22624', Icone: Zap, icone: '🇯🇵' },
};

const VISUAL_PADRAO = { cor: '#3A3B3C', Icone: Wrench, icone: '🔧' };

export function getEstiloVisual(codigo) {
  return VISUAL_POR_CODIGO[codigo] || VISUAL_PADRAO;
}