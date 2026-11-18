import {
  ChevronsDown, Mountain, Flag, EyeOff, Clock, Zap, Wrench,
  Car, Wind, MoveVertical, Flame, Cpu, Volume2,
} from 'lucide-react-native';

export const TIPO_CUSTOMIZACAO = {
  ESTILO: 'ESTILO',
  PERSONALIZADA: 'PERSONALIZADA',
};

// Visual (ícone/cor) por código conhecido — puramente estético.
// Estilos novos criados pelo admin caem no visual padrão até decidirmos mapear um específico.
// `icone` (emoji) fica temporariamente para telas ainda não redesenhadas; usar `Icone` (lucide).
const VISUAL_POR_CODIGO = {
  STREET: { cor: '#4A5568', Icone: Car, icone: '🚗' },
  JDM: { cor: '#C22624', Icone: Zap, icone: '🇯🇵' },
  STANCE: { cor: '#E9302E', Icone: ChevronsDown, icone: '🔻' },
  TRACK_DAY: { cor: '#8F2A28', Icone: Flag, icone: '🏁' },
  DRIFT: { cor: '#B5452F', Icone: Wind, icone: '🌀' },
  OFF_ROAD: { cor: '#6B5B3E', Icone: Mountain, icone: '⛰️' },
  SLEEPER: { cor: '#2B2C2E', Icone: EyeOff, icone: '🕶️' },
  LOWRIDER: { cor: '#7B3F8C', Icone: MoveVertical, icone: '↕️' },
  CLASSIC_RETRO: { cor: '#9A6B3F', Icone: Clock, icone: '🕰️' },
  OLD_SCHOOL: { cor: '#B8621B', Icone: Flame, icone: '🔥' },
  RESTOMOD: { cor: '#2F5D62', Icone: Cpu, icone: '🛠️' },
  SOM_AUTOMOTIVO: { cor: '#1F4E79', Icone: Volume2, icone: '🔊' },
  // Desativado no banco, mas mantido para o projeto antigo que ainda usa este código
  TRACK_RACING: { cor: '#8F2A28', Icone: Flag, icone: '🏁' },
};

const VISUAL_PADRAO = { cor: '#3A3B3C', Icone: Wrench, icone: '🔧' };

export function getEstiloVisual(codigo) {
  return VISUAL_POR_CODIGO[codigo] || VISUAL_PADRAO;
}