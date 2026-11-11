import { useCallback } from 'react';
import { useConfirm } from '../contexts/ConfirmContext';

/*
  Pergunta antes de fechar um formulário com alterações.
  const podeDescartar = useConfirmarDescarte();
  const fecharModal = async () => {
    if (await podeDescartar(alterado)) setModal(null);
  };
*/
export const useConfirmarDescarte = () => {
  const confirmar = useConfirm();

  return useCallback(
    async (alterado) =>
      !alterado ||
      confirmar({
        titulo: 'Descartar alterações?',
        mensagem: 'O que você digitou neste formulário será perdido.',
        textoConfirmar: 'Descartar',
        textoCancelar: 'Continuar editando',
        perigo: true,
      }),
    [confirmar]
  );
};