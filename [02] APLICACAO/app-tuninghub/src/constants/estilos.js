export const TIPO_CUSTOMIZACAO = {
  ESTILO: 'ESTILO',
  PERSONALIZADA: 'PERSONALIZADA',
};

// Visual (ícone/cor) por código conhecido — puramente estético.
// Estilos novos criados pelo admin caem no visual padrão até decidirmos mapear um específico.
const VISUAL_POR_CODIGO = {
  STANCE: { cor: '#E9302E', icone: '🔻' },
  OFF_ROAD: { cor: '#8F2A28', icone: '⛰️' },
  TRACK_RACING: { cor: '#C22624', icone: '🏁' },
  SLEEPER: { cor: '#5C5957', icone: '🕶️' },
  CLASSIC_RETRO: { cor: '#ACA8A5', icone: '🕰️' },
  JDM: { cor: '#E9302E', icone: '🇯🇵' },
};

const VISUAL_PADRAO = { cor: '#131314', icone: '🔧' };

export function getEstiloVisual(codigo) {
  return VISUAL_POR_CODIGO[codigo] || VISUAL_PADRAO;
}