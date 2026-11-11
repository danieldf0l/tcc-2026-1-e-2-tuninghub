import { useEffect } from 'react';

/*
  Avisa o navegador para perguntar "Sair do site?" no F5 ou ao fechar a aba
  enquanto houver alterações não salvas.
  Uso: useAlteracoesNaoSalvas(alterado);

  Para fechar Modal/Drawer com alterações, use o useConfirm() no onFechar.
*/
export const useAlteracoesNaoSalvas = (temAlteracoes) => {
  useEffect(() => {
    if (!temAlteracoes) return undefined;

    const aoSair = (e) => {
      e.preventDefault();
      e.returnValue = ''; // necessário no Chrome/Edge
    };

    window.addEventListener('beforeunload', aoSair);
    return () => window.removeEventListener('beforeunload', aoSair);
  }, [temAlteracoes]);
};