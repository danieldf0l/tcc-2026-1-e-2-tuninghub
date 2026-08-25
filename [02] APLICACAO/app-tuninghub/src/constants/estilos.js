export const ESTILOS = [
  { valor: 'STANCE', rotulo: 'Stance', descricao: 'Visual agressivo, rebaixamento e ângulo de rodas', cor: '#E9302E', icone: '🔻' },
  { valor: 'OFF_ROAD', rotulo: 'Off-Road', descricao: 'Preparação para trilha e terrenos irregulares', cor: '#8F2A28', icone: '⛰️' },
  { valor: 'TRACK_RACING', rotulo: 'Track / Racing', descricao: 'Performance e desempenho em pista', cor: '#C22624', icone: '🏁' },
  { valor: 'SLEEPER', rotulo: 'Sleeper', descricao: 'Potência escondida sob visual discreto', cor: '#5C5957', icone: '🕶️' },
  { valor: 'CLASSIC_RETRO', rotulo: 'Clássico / Retrô', descricao: 'Restauração com estética de época', cor: '#ACA8A5', icone: '🕰️' },
  { valor: 'JDM', rotulo: 'JDM', descricao: 'Estética e peças de importados japoneses', cor: '#E9302E', icone: '🇯🇵' },
];

export const TIPO_CUSTOMIZACAO = {
  ESTILO: 'ESTILO',
  PERSONALIZADA: 'PERSONALIZADA',
};

export function getEstiloInfo(valor) {
  return ESTILOS.find((e) => e.valor === valor) || {
    valor: null,
    rotulo: 'Personalizado',
    cor: '#131314',
    icone: '🔧',
  };
}