import { Alert } from 'react-native';

// Espelham as regras do backend (projeto.service.js)
export const LIMITE_PROJETOS_ATIVOS = 3;
export const LIMITE_PROJETOS_ARQUIVADOS = 3;

// O backend responde 409 "Limite de 3 projetos arquivados atingido..." ao arquivar
export function ehErroLimiteArquivados(mensagem) {
  return /limite/i.test(mensagem || '') && /arquivad/i.test(mensagem || '');
}

export function avisarLimiteArquivados(navigation) {
  Alert.alert(
    'Limite de arquivados',
    `Você já tem ${LIMITE_PROJETOS_ARQUIVADOS} projetos arquivados. Exclua um deles para poder arquivar outro.`,
    [
      { text: 'Agora não', style: 'cancel' },
      { text: 'Ver arquivados', onPress: () => navigation.navigate('ProjetosArquivados') },
    ]
  );
}